import { FULL_STORY_DATASET } from '../core/data/dataset.js';
import { StoryGraphEngine } from '../core/graph/graph-engine.js';
import { StorageService } from '../core/storage/storage-service.js';
import { StoryNode, ProgressStatus, ProgressBackupData } from '../core/types.js';
import { Header } from './components/header/header.js';
import { FilterBar, FilterBarState } from './components/filter-bar/filter-bar.js';
import { StoryCanvas } from './components/canvas/canvas.js';
import { DetailPanel } from './components/detail-panel/detail-panel.js';
import { BackupModal } from './components/backup-modal/backup-modal.js';

export class App {
  private readonly engine: StoryGraphEngine;
  private readonly storage: StorageService;

  private header!: Header;
  private filterBar!: FilterBar;
  private canvas!: StoryCanvas;
  private detailPanel!: DetailPanel;
  private backupModal!: BackupModal;

  private selectedNode: StoryNode | null = null;

  constructor(private readonly rootElement: HTMLElement) {
    this.engine = new StoryGraphEngine(FULL_STORY_DATASET);
    this.storage = new StorageService();

    this.initUI();
    this.refreshAll();
  }

  private initUI(): void {
    const settings = this.storage.getSettings();
    const progressMap = this.getProgressStatusMap();
    const completedCount = Object.values(progressMap).filter(s => s === 'completed').length;

    // 1. Header
    this.header = new Header(
      settings,
      this.engine.getAllNodes().length,
      completedCount,
      {
        onToggleSpoiler: (enabled) => {
          this.storage.updateSettings({ spoilerMaskEnabled: enabled });
          this.header.updateSettings(this.storage.getSettings());
          this.detailPanel.updateSpoilerSetting(enabled);
        },
        onOpenBackupModal: () => {
          this.backupModal.open();
        },
        onResetAll: () => {
          this.storage.clearAllProgress();
          this.refreshAll();
        }
      }
    );

    // 2. Filter Bar
    this.filterBar = new FilterBar(
      {
        category: settings.activeFilterCategory,
        faction: settings.activeFilterFaction,
        sortMode: settings.sortMode
      },
      {
        onChange: () => {
          this.refreshCanvas();
        }
      }
    );

    // 3. Canvas Workspace Container
    const workspace = document.createElement('main');
    workspace.className = 'workspace-container';

    // 4. Canvas
    this.canvas = new StoryCanvas({
      onSelectNode: (node) => {
        this.selectedNode = node;
        this.openDetail(node);
      },
      onDeselect: () => {
        this.selectedNode = null;
        this.detailPanel.close();
      }
    });
    workspace.appendChild(this.canvas.container);

    // 5. Detail Panel
    this.detailPanel = new DetailPanel({
      onStatusChange: (nodeId, status) => {
        this.storage.setProgress(nodeId, status);
        this.refreshAll();
      },
      onClose: () => {
        this.selectedNode = null;
        this.canvas.selectNode(null);
      }
    });
    workspace.appendChild(this.detailPanel.element);

    // 6. Backup Modal
    this.backupModal = new BackupModal({
      onExport: () => this.storage.exportBackupData(),
      onImport: (backup: ProgressBackupData) => {
        this.storage.importBackupData(backup);
        this.refreshAll();
      },
      onReset: () => {
        this.storage.clearAllProgress();
        this.refreshAll();
      }
    });

    // Assemble App
    this.rootElement.appendChild(this.header.element);
    this.rootElement.appendChild(this.filterBar.element);
    this.rootElement.appendChild(workspace);
    this.rootElement.appendChild(this.backupModal.element);
  }

  private getProgressStatusMap(): Record<string, ProgressStatus> {
    const all = this.storage.getAllProgress();
    const map: Record<string, ProgressStatus> = {};
    for (const [id, p] of Object.entries(all)) {
      map[id] = p.status;
    }
    return map;
  }

  private refreshAll(): void {
    const progressMap = this.getProgressStatusMap();
    const completedNodeIds = new Set(
      Object.entries(progressMap)
        .filter(([, s]) => s === 'completed')
        .map(([id]) => id)
    );

    // Update Header progress stats
    this.header.updateProgress(
      this.engine.getAllNodes().length,
      completedNodeIds.size
    );

    this.refreshCanvas();

    // Refresh detail panel if open
    if (this.selectedNode) {
      this.openDetail(this.selectedNode);
    }
  }

  private refreshCanvas(): void {
    const filterState: FilterBarState = this.filterBar.getState();
    const filterRes = this.engine.filterGraph({
      category: filterState.category,
      faction: filterState.faction,
      searchKeyword: filterState.searchKeyword,
      sortMode: filterState.sortMode
    });

    const progressMap = this.getProgressStatusMap();
    const completedNodeIds = new Set(
      Object.entries(progressMap)
        .filter(([, s]) => s === 'completed')
        .map(([id]) => id)
    );

    const recommendedNodes = this.engine.getRecommendedNextStories(completedNodeIds);
    const recommendedIds = new Set(recommendedNodes.map(n => n.id));

    const isFiltering =
      filterState.category !== 'all' ||
      filterState.faction !== 'all' ||
      filterState.searchKeyword.trim() !== '';

    this.canvas.setData(
      this.engine.getAllNodes(),
      this.engine.getAllEdges(),
      progressMap,
      recommendedIds,
      isFiltering ? filterRes.matchedNodeIds : null
    );
  }

  private openDetail(node: StoryNode): void {
    const status = this.storage.getProgress(node.id)?.status || 'unread';
    const prereqs = this.engine.getPrerequisites(node.id);
    const successors = this.engine.getSuccessors(node.id);
    const settings = this.storage.getSettings();

    this.detailPanel.showNode(
      node,
      status,
      prereqs,
      successors,
      settings.spoilerMaskEnabled
    );
  }
}
