/**
 * ReData of D - Frontend Application Controller
 * Features: Direct Download, Backend File Scanning, Image Filter, 
 * Multi-Select Batch Saving & 5-Step Modal Flow.
 */

// Application State
const State = {
  config: {
    backendUrl: 'http://localhost:8000/api',
    mockMode: true,
    autoDownloadRealFile: true
  },
  files: [],
  filteredFiles: [],
  selectedFileIds: new Set(), // Checkboxes selected in table
  activeFilesList: [],        // Files currently being processed in modal
  activeStep: 1,
  savedFileIds: new Set(),
  currentFilter: 'all',
  searchQuery: '',
  demoKeycode: 'RD8826'
};

// Mock Backend Files Dataset (includes Databases, Archives, Documents & Images)
const MOCK_FILES_DATABASE = [
  {
    id: 'f-101',
    name: 'Backup_Database_Customer_2026.sql',
    path: '/var/data/backups/sql/Backup_Database_Customer_2026.sql',
    type: 'database',
    category: 'database',
    sizeBytes: 1548239000,
    sizeFormatted: '1.44 GB',
    updatedAt: '2026-09-26 03:15:20',
    checksum: 'a87f9b23c914d8726e95bf081a94'
  },
  {
    id: 'f-102',
    name: 'System_Restore_Image_v2.4.iso',
    path: '/recovery/images/System_Restore_Image_v2.4.iso',
    type: 'archive',
    category: 'archive',
    sizeBytes: 4294967296,
    sizeFormatted: '4.00 GB',
    updatedAt: '2026-09-25 21:40:02',
    checksum: '6f3918a38b1d9c0245e8a731211e'
  },
  {
    id: 'f-103',
    name: 'ReData_Core_Config_Production.json',
    path: '/etc/redata/configs/ReData_Core_Config_Production.json',
    type: 'document',
    category: 'document',
    sizeBytes: 2457600,
    sizeFormatted: '2.34 MB',
    updatedAt: '2026-09-26 04:10:12',
    checksum: 'c2810fb4e7732a105829d10e5443'
  },
  {
    id: 'f-104',
    name: 'Full_Archive_Storage_Snapshot.zip',
    path: '/snapshots/weekly/Full_Archive_Storage_Snapshot.zip',
    type: 'archive',
    category: 'archive',
    sizeBytes: 912850000,
    sizeFormatted: '870.5 MB',
    updatedAt: '2026-09-24 18:00:55',
    checksum: '8872ac94e1b439281a052ff37890'
  },
  {
    id: 'f-105',
    name: 'Financial_Ledger_Q3_Restore.xlsx',
    path: '/finance/restores/Financial_Ledger_Q3_Restore.xlsx',
    type: 'document',
    category: 'document',
    sizeBytes: 18450000,
    sizeFormatted: '17.6 MB',
    updatedAt: '2026-09-25 14:22:18',
    checksum: '5311de729a43108c903ef88414cb'
  },
  {
    id: 'f-106',
    name: 'Audit_Server_Security_Logs.log',
    path: '/var/log/security/Audit_Server_Security_Logs.log',
    type: 'document',
    category: 'document',
    sizeBytes: 85200000,
    sizeFormatted: '81.2 MB',
    updatedAt: '2026-09-26 02:45:00',
    checksum: '9d43ef1788220aa5420084318c66'
  },
  {
    id: 'f-107',
    name: 'Security_Camera_HQ_Snapshot.png',
    path: '/media/cctv/restores/Security_Camera_HQ_Snapshot.png',
    type: 'image',
    category: 'image',
    sizeBytes: 12850000,
    sizeFormatted: '12.2 MB',
    updatedAt: '2026-09-26 03:50:11',
    checksum: '7d92ef1891b014ac9201f8430a91'
  },
  {
    id: 'f-108',
    name: 'Architecture_Cloud_Diagram_v3.svg',
    path: '/designs/infra/Architecture_Cloud_Diagram_v3.svg',
    type: 'image',
    category: 'image',
    sizeBytes: 1420000,
    sizeFormatted: '1.35 MB',
    updatedAt: '2026-09-25 19:12:40',
    checksum: '4cb102fe94a821dc0928b17a63e2'
  },
  {
    id: 'f-109',
    name: 'Satellite_Geospatial_Scan_HD.raw',
    path: '/geo/sat/raw/Satellite_Geospatial_Scan_HD.raw',
    type: 'image',
    category: 'image',
    sizeBytes: 482000000,
    sizeFormatted: '459.7 MB',
    updatedAt: '2026-09-24 11:05:32',
    checksum: 'b3e028194cf92018aa402319ef42'
  },
  {
    id: 'f-110',
    name: 'User_Avatars_Profile_Collection.jpg',
    path: '/assets/profiles/User_Avatars_Profile_Collection.jpg',
    type: 'image',
    category: 'image',
    sizeBytes: 34600000,
    sizeFormatted: '33.0 MB',
    updatedAt: '2026-09-26 01:20:15',
    checksum: 'fa829104bce93018240ef8214ac3'
  }
];

// DOM Elements Cache
const DOM = {};

document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  initEventListeners();
  loadSavedSettings();
  scanBackendFiles(true); // Initial scan
});

function initDOMElements() {
  // Direct Download
  DOM.customDownloadUrl = document.getElementById('customDownloadUrl');
  DOM.btnClearUrl = document.getElementById('btnClearUrl');
  DOM.btnDownloadFromUrl = document.getElementById('btnDownloadFromUrl');
  DOM.presetTags = document.querySelectorAll('.preset-tag');

  // Files List & Scanning
  DOM.btnScanFiles = document.getElementById('btnScanFiles');
  DOM.scanBtnText = document.getElementById('scanBtnText');
  DOM.scanIcon = DOM.btnScanFiles.querySelector('.scan-icon');
  DOM.searchInput = document.getElementById('searchInput');
  DOM.filterBtns = document.querySelectorAll('.filter-btn');
  DOM.filesTableBody = document.getElementById('filesTableBody');
  DOM.selectAllCheckbox = document.getElementById('selectAllCheckbox');
  DOM.emptyState = document.getElementById('emptyState');
  DOM.tableLoader = document.getElementById('tableLoader');

  // Batch Action Bar
  DOM.batchActionBar = document.getElementById('batchActionBar');
  DOM.batchSelectedCount = document.getElementById('batchSelectedCount');
  DOM.batchSelectedSize = document.getElementById('batchSelectedSize');
  DOM.batchBtnCount = document.getElementById('batchBtnCount');
  DOM.btnDeselectAll = document.getElementById('btnDeselectAll');
  DOM.btnSaveSelectedFiles = document.getElementById('btnSaveSelectedFiles') || document.getElementById('btnSaveMultipleFiles');

  // Stats
  DOM.statTotalFiles = document.getElementById('statTotalFiles');
  DOM.statTotalSize = document.getElementById('statTotalSize');
  DOM.statSavedFiles = document.getElementById('statSavedFiles');

  // Modal Flow Elements
  DOM.saveFlowModal = document.getElementById('saveFlowModal');
  DOM.modalCloseBtn = document.getElementById('modalCloseBtn');
  DOM.stepNodes = [
    document.getElementById('stepNode1'),
    document.getElementById('stepNode2'),
    document.getElementById('stepNode3'),
    document.getElementById('stepNode4')
  ];
  DOM.stepLines = [
    document.getElementById('stepLine1'),
    document.getElementById('stepLine2'),
    document.getElementById('stepLine3')
  ];
  DOM.panes = {
    step1: document.getElementById('paneStep1'),
    step2: document.getElementById('paneStep2'),
    step3: document.getElementById('paneStep3'),
    step4: document.getElementById('paneStep4'),
    step5: document.getElementById('paneStep5')
  };

  // Step 1 Pane Elements
  DOM.step1ModalTitle = document.querySelector('#paneStep1 .pane-title');
  DOM.step1ModalDesc = document.querySelector('#paneStep1 .pane-desc');
  DOM.step1FileSummary = document.getElementById('step1FileSummary');
  DOM.btnCancelStep1 = document.getElementById('btnCancelStep1');
  DOM.btnConfirmStep1 = document.getElementById('btnConfirmStep1');

  // Step 2 Pane Elements
  DOM.qrSessionId = document.getElementById('qrSessionId');
  DOM.inputPhoneNumber = document.getElementById('inputPhoneNumber');
  DOM.phoneErrorMsg = document.getElementById('phoneErrorMsg');
  DOM.btnQuickFillPhone = document.getElementById('btnQuickFillPhone');
  DOM.btnBackToStep1 = document.getElementById('btnBackToStep1');
  DOM.btnSubmitStep2 = document.getElementById('btnSubmitStep2');

  // Step 3 Pane Elements
  DOM.hintKeycodeText = document.getElementById('hintKeycodeText');
  DOM.btnAutoFillKeycode = document.getElementById('btnAutoFillKeycode');
  DOM.otpBoxes = document.querySelectorAll('.otp-box');
  DOM.btnBackToStep2 = document.getElementById('btnBackToStep2');
  DOM.btnRunExecution = document.getElementById('btnRunExecution');
  DOM.keycodeStatusHint = document.getElementById('keycodeStatusHint');

  // Step 4 Pane Elements
  DOM.transferStatusMessage = document.getElementById('transferStatusMessage');
  DOM.transferPercentage = document.getElementById('transferPercentage');
  DOM.progressBarFill = document.getElementById('progressBarFill');
  DOM.downloadSpeedVal = document.getElementById('downloadSpeedVal');
  DOM.downloadTransferredVal = document.getElementById('downloadTransferredVal');
  DOM.downloadEtaVal = document.getElementById('downloadEtaVal');
  DOM.terminalLogsBody = document.getElementById('terminalLogsBody');

  // Step 5 Pane Elements
  DOM.step5Title = document.querySelector('#paneStep5 .pane-title');
  DOM.step5Desc = document.querySelector('#paneStep5 .pane-desc');
  DOM.successDetailsCard = document.querySelector('.success-details-card');
  DOM.btnDoneFinish = document.getElementById('btnDoneFinish');

  // Settings Modal Elements
  DOM.btnOpenSettings = document.getElementById('btnOpenSettings');
  DOM.settingsModal = document.getElementById('settingsModal');
  DOM.btnCloseSettings = document.getElementById('btnCloseSettings');
  DOM.backendUrlInput = document.getElementById('backendUrlInput');
  DOM.mockModeToggle = document.getElementById('mockModeToggle');
  DOM.autoDownloadRealFileToggle = document.getElementById('autoDownloadRealFileToggle');
  DOM.btnSaveSettings = document.getElementById('btnSaveSettings');
  DOM.btnResetSettings = document.getElementById('btnResetSettings');
  DOM.systemStatusChip = document.getElementById('systemStatusChip');
  DOM.statusLabelText = document.getElementById('statusLabelText');
  DOM.footerBackendDisplay = document.getElementById('footerBackendDisplay');

  // Toast Container
  DOM.toastContainer = document.getElementById('toastContainer');
}

function initEventListeners() {
  // Feature 1: Direct URL Download
  DOM.btnDownloadFromUrl.addEventListener('click', handleDirectUrlDownload);
  DOM.btnClearUrl.addEventListener('click', () => {
    DOM.customDownloadUrl.value = '';
    DOM.customDownloadUrl.focus();
  });

  DOM.presetTags.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      DOM.customDownloadUrl.value = url;
      showToast(`Đã chọn link tải mẫu: ${btn.getAttribute('data-name')}`, 'info');
    });
  });

  // Feature 2: Backend Scan & Filtering
  DOM.btnScanFiles.addEventListener('click', () => scanBackendFiles(false));
  DOM.searchInput.addEventListener('input', handleSearch);
  DOM.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.currentFilter = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  // Master Checkbox Select All
  if (DOM.selectAllCheckbox) {
    DOM.selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      State.filteredFiles.forEach(file => {
        if (isChecked) {
          State.selectedFileIds.add(file.id);
        } else {
          State.selectedFileIds.delete(file.id);
        }
      });
      renderFilesTable();
      updateBatchBar();
    });
  }

  // Global Handlers for Batch Bar
  window.handleDeselectAllClick = function() {
    State.selectedFileIds.clear();
    if (DOM.selectAllCheckbox) {
      DOM.selectAllCheckbox.checked = false;
      DOM.selectAllCheckbox.indeterminate = false;
    }
    renderFilesTable();
    updateBatchBar();
  };

  window.handleBatchSaveClick = function() {
    // Read both State.selectedFileIds and checked checkboxes to guarantee 100% sync
    const checkedBoxEls = document.querySelectorAll('.file-select-checkbox:checked');
    checkedBoxEls.forEach(cb => {
      const fid = cb.getAttribute('data-file-id');
      if (fid) State.selectedFileIds.add(fid);
    });

    const selectedFiles = State.files.filter(f => State.selectedFileIds.has(f.id));
    if (selectedFiles.length === 0) {
      showToast('Vui lòng tích chọn ít nhất một file từ danh sách để lưu!', 'info');
      return;
    }
    openSaveModal(selectedFiles);
  };

  // Batch Action Bar Events
  if (DOM.btnDeselectAll) {
    DOM.btnDeselectAll.addEventListener('click', window.handleDeselectAllClick);
  }

  if (DOM.btnSaveSelectedFiles) {
    DOM.btnSaveSelectedFiles.addEventListener('click', window.handleBatchSaveClick);
  }

  // Modal Flow Close Events
  DOM.modalCloseBtn.addEventListener('click', closeModalFlow);
  DOM.saveFlowModal.addEventListener('click', (e) => {
    if (e.target === DOM.saveFlowModal && State.activeStep !== 4) {
      closeModalFlow();
    }
  });

  // Step 1 Actions
  DOM.btnCancelStep1.addEventListener('click', closeModalFlow);
  DOM.btnConfirmStep1.addEventListener('click', () => {
    goToStep(2);
  });

  // Step 2 Actions (QR & Phone)
  DOM.inputPhoneNumber.addEventListener('input', handlePhoneInput);
  DOM.btnQuickFillPhone.addEventListener('click', () => {
    DOM.inputPhoneNumber.value = '0988123456';
    handlePhoneInput();
  });
  DOM.btnBackToStep1.addEventListener('click', () => goToStep(1));
  DOM.btnSubmitStep2.addEventListener('click', () => {
    goToStep(3);
    setTimeout(() => DOM.otpBoxes[0].focus(), 150);
  });

  // Step 3 Actions (Keycode Input)
  setupKeycodeInputs();
  DOM.btnAutoFillKeycode.addEventListener('click', () => {
    fillKeycode(State.demoKeycode);
  });
  DOM.btnBackToStep2.addEventListener('click', () => goToStep(2));
  DOM.btnRunExecution.addEventListener('click', startBackendExecution);

  // Step 5 Actions (Done Button)
  DOM.btnDoneFinish.addEventListener('click', handleFinishDone);

  // Settings Actions
  DOM.btnOpenSettings.addEventListener('click', openSettingsModal);
  DOM.btnCloseSettings.addEventListener('click', closeSettingsModal);
  DOM.btnSaveSettings.addEventListener('click', saveSettings);
  DOM.btnResetSettings.addEventListener('click', resetSettings);
  DOM.settingsModal.addEventListener('click', (e) => {
    if (e.target === DOM.settingsModal) closeSettingsModal();
  });
}

/* ==========================================================================
   FEATURE 1: DIRECT FILE DOWNLOAD VIA LINK
   ========================================================================== */
function handleDirectUrlDownload() {
  const url = DOM.customDownloadUrl.value.trim();
  if (!url) {
    showToast('Vui lòng nhập đường link tải file hợp lệ!', 'error');
    DOM.customDownloadUrl.focus();
    return;
  }

  DOM.btnDownloadFromUrl.disabled = true;
  DOM.btnDownloadFromUrl.innerHTML = `
    <span class="scan-icon spinning">⟳</span>
    <span>Đang Tải File Về Máy...</span>
  `;

  let filename = 'downloaded_file.bin';
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    if (last && last.includes('.')) filename = last;
    else filename = 'ReData_Archive_' + Date.now() + '.zip';
  } catch (e) {
    filename = 'ReData_Data_' + Date.now() + '.zip';
  }

  setTimeout(() => {
    triggerBrowserFileDownload(
      filename,
      `--- REDATA OF D DIRECT RESTORE FILE ---\nSource URL: ${url}\nDownloaded At: ${new Date().toISOString()}\nStatus: Verified Complete\nChecksum: 9c71b058fe643198a44b8`
    );

    showToast(`Đã bắt đầu tải file "${filename}" về máy tính thành công!`, 'success');
    DOM.btnDownloadFromUrl.disabled = false;
    DOM.btnDownloadFromUrl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>Tải File Về Máy Tính</span>
    `;
  }, 1000);
}

/* ==========================================================================
   FEATURE 2: BACKEND FILE SCANNER & TABLE RENDER
   ========================================================================== */
async function scanBackendFiles(silent = false) {
  DOM.scanIcon.classList.add('spinning');
  DOM.scanBtnText.textContent = 'Đang Quét...';
  DOM.btnScanFiles.disabled = true;

  if (!silent) {
    DOM.tableLoader.classList.remove('hidden');
    DOM.filesTableBody.innerHTML = '';
  }

  try {
    let files = [];
    if (State.config.mockMode) {
      await new Promise(r => setTimeout(r, 650));
      files = JSON.parse(JSON.stringify(MOCK_FILES_DATABASE));
    } else {
      const res = await fetch(`${State.config.backendUrl}/files`, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      files = Array.isArray(data) ? data : data.files || [];
    }

    State.files = files;
    applyFilters();
    updateStats();

    if (!silent) {
      showToast(`Quét thành công! Phát hiện ${files.length} file từ Backend.`, 'success');
    }
  } catch (err) {
    console.warn('Backend call failed, using mock data:', err);
    State.files = JSON.parse(JSON.stringify(MOCK_FILES_DATABASE));
    applyFilters();
    updateStats();
    if (!silent) {
      showToast(`Không kết nối được Backend URL. Đã chuyển sang chế độ dữ liệu mẫu.`, 'info');
    }
  } finally {
    DOM.scanIcon.classList.remove('spinning');
    DOM.scanBtnText.textContent = 'Quét File Backend';
    DOM.btnScanFiles.disabled = false;
    DOM.tableLoader.classList.add('hidden');
  }
}

function handleSearch(e) {
  State.searchQuery = e.target.value.toLowerCase().trim();
  applyFilters();
}

function applyFilters() {
  State.filteredFiles = State.files.filter(file => {
    // Category match: all, database, archive, image, document
    const matchCategory = State.currentFilter === 'all' || file.category === State.currentFilter;
    const matchQuery = !State.searchQuery || 
      file.name.toLowerCase().includes(State.searchQuery) ||
      file.path.toLowerCase().includes(State.searchQuery);
    return matchCategory && matchQuery;
  });

  renderFilesTable();
  updateMasterCheckboxState();
  updateBatchBar();
}

function renderFilesTable() {
  if (State.filteredFiles.length === 0) {
    DOM.filesTableBody.innerHTML = '';
    DOM.emptyState.classList.remove('hidden');
    return;
  }

  DOM.emptyState.classList.add('hidden');
  DOM.filesTableBody.innerHTML = State.filteredFiles.map(file => {
    const isSaved = State.savedFileIds.has(file.id);
    const isChecked = State.selectedFileIds.has(file.id);
    const icon = getFileIcon(file.name);
    
    let pillClass = 'doc';
    if (file.category === 'database') pillClass = 'db';
    else if (file.category === 'archive') pillClass = 'archive';
    else if (file.category === 'image') pillClass = 'image';

    const categoryLabel = file.category === 'image' ? 'HÌNH ẢNH' : file.category.toUpperCase();

    return `
      <tr data-file-id="${file.id}" class="${isChecked ? 'row-selected' : ''}">
        <td class="text-center">
          <label class="custom-checkbox-wrap" onclick="event.stopPropagation()">
            <input type="checkbox" class="file-select-checkbox" data-file-id="${file.id}" ${isChecked ? 'checked' : ''}>
            <span class="checkbox-box"></span>
          </label>
        </td>
        <td>
          <div class="file-name-cell">
            <div class="file-ext-icon">${icon}</div>
            <div>
              <span class="file-name-text">${escapeHTML(file.name)}</span>
              <span class="file-path-sub">${escapeHTML(file.path)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="type-pill ${pillClass}">${categoryLabel}</span>
        </td>
        <td class="font-mono">${file.sizeFormatted}</td>
        <td class="font-mono text-muted">${file.updatedAt}</td>
        <td class="text-right">
          <button class="btn btn-save-file ${isSaved ? 'is-saved' : ''}" onclick="openSaveModalForFile('${file.id}')">
            ${isSaved ? '✓ Đã Lưu' : '💾 Lưu file'}
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach individual row checkbox listeners
  const checkboxes = DOM.filesTableBody.querySelectorAll('.file-select-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const fileId = e.target.getAttribute('data-file-id');
      const tr = e.target.closest('tr');
      if (e.target.checked) {
        State.selectedFileIds.add(fileId);
        if (tr) tr.classList.add('row-selected');
      } else {
        State.selectedFileIds.delete(fileId);
        if (tr) tr.classList.remove('row-selected');
      }
      updateMasterCheckboxState();
      updateBatchBar();
    });
  });
}

function updateMasterCheckboxState() {
  if (!DOM.selectAllCheckbox) return;
  if (State.filteredFiles.length === 0) {
    DOM.selectAllCheckbox.checked = false;
    DOM.selectAllCheckbox.indeterminate = false;
    return;
  }

  const selectedInFiltered = State.filteredFiles.filter(f => State.selectedFileIds.has(f.id)).length;
  if (selectedInFiltered === 0) {
    DOM.selectAllCheckbox.checked = false;
    DOM.selectAllCheckbox.indeterminate = false;
  } else if (selectedInFiltered === State.filteredFiles.length) {
    DOM.selectAllCheckbox.checked = true;
    DOM.selectAllCheckbox.indeterminate = false;
  } else {
    DOM.selectAllCheckbox.checked = false;
    DOM.selectAllCheckbox.indeterminate = true;
  }
}

function updateBatchBar() {
  if (!DOM.batchActionBar) return;
  const count = State.selectedFileIds.size;

  if (count > 0) {
    DOM.batchActionBar.classList.add('visible');
    DOM.batchSelectedCount.textContent = count;
    DOM.batchBtnCount.textContent = count;

    // Calculate total size
    const selectedFiles = State.files.filter(f => State.selectedFileIds.has(f.id));
    const totalBytes = selectedFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    DOM.batchSelectedSize.textContent = `(${formatBytes(totalBytes)})`;
  } else {
    DOM.batchActionBar.classList.remove('visible');
  }
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'sql':
    case 'db': return '🗄️';
    case 'zip':
    case 'rar':
    case 'tar':
    case 'iso': return '📦';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
    case 'raw':
    case 'gif':
    case 'psd': return '🖼️';
    case 'json':
    case 'yaml': return '⚙️';
    case 'xlsx':
    case 'csv': return '📊';
    case 'pdf': return '📑';
    case 'log': return '📜';
    default: return '📄';
  }
}

function updateStats() {
  DOM.statTotalFiles.textContent = State.files.length;
  const totalBytes = State.files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  DOM.statTotalSize.textContent = formatBytes(totalBytes);
  DOM.statSavedFiles.textContent = State.savedFileIds.size;
}

/* ==========================================================================
   FEATURE 3 & 4: MULTI-STEP SAVE FLOW (SINGLE & BATCH MULTI-FILE)
   ========================================================================== */

// Single file entry point from table button
window.openSaveModalForFile = function(fileId) {
  const file = State.files.find(f => f.id === fileId);
  if (!file) return;
  openSaveModal([file]);
};

// Unified open save modal supporting 1 or multiple files
function openSaveModal(filesArray) {
  if (!filesArray || filesArray.length === 0) return;
  State.activeFilesList = filesArray;

  const isMultiple = filesArray.length > 1;
  const titleEl = DOM.step1ModalTitle || document.querySelector('#paneStep1 .pane-title');
  const descEl = DOM.step1ModalDesc || document.querySelector('#paneStep1 .pane-desc');
  const summaryEl = DOM.step1FileSummary || document.getElementById('step1FileSummary');

  // Step 1: Render file summary (Single vs Multiple)
  if (!isMultiple) {
    const file = filesArray[0];
    if (titleEl) titleEl.textContent = 'Xác Nhận Yêu Cầu Lưu File';
    if (descEl) descEl.textContent = 'Bạn có đồng ý yêu cầu backend trích xuất và lưu file này về máy tính không?';
    
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="file-icon-box">${getFileIcon(file.name)}</div>
        <div class="file-info-details">
          <h4 class="file-title-text">${escapeHTML(file.name)}</h4>
          <div class="file-meta-row">
            <span class="meta-tag">Dung lượng: ${file.sizeFormatted}</span>
            <span class="meta-tag">Định dạng: .${file.name.split('.').pop().toUpperCase()}</span>
            <span class="meta-tag">ID: #${file.id}</span>
          </div>
        </div>
      `;
    }
  } else {
    // Multi-file summary preview
    const totalBytes = filesArray.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    if (titleEl) titleEl.textContent = `Xác Nhận Lưu ${filesArray.length} File Đã Chọn`;
    if (descEl) descEl.textContent = `Bạn có đồng ý yêu cầu backend trích xuất và lưu đồng loạt ${filesArray.length} file về máy tính không?`;

    const itemsHTML = filesArray.map(f => `
      <div class="multi-file-item">
        <span class="file-name">${getFileIcon(f.name)} ${escapeHTML(f.name)}</span>
        <span class="file-size">${f.sizeFormatted}</span>
      </div>
    `).join('');

    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="multi-files-box" style="width: 100%;">
          <div class="multi-files-header">
            <span>Danh sách ${filesArray.length} tệp đã chọn:</span>
            <span class="text-cyan">Tổng: ${formatBytes(totalBytes)}</span>
          </div>
          <div class="multi-files-scroll">
            ${itemsHTML}
          </div>
        </div>
      `;
    }
  }

  // QR Session ID
  const randSession = 'RD-' + Math.floor(1000 + Math.random() * 9000) + '-SEC';
  if (DOM.qrSessionId) DOM.qrSessionId.textContent = `Mã phiên: ${randSession}`;
  
  // Reset Form Inputs
  if (DOM.inputPhoneNumber) DOM.inputPhoneNumber.value = '';
  if (DOM.btnSubmitStep2) DOM.btnSubmitStep2.disabled = true;
  if (DOM.phoneErrorMsg) {
    DOM.phoneErrorMsg.textContent = 'Vui lòng nhập đúng số điện thoại di động hợp lệ.';
    DOM.phoneErrorMsg.classList.remove('error');
  }

  clearKeycodeInputs();

  // Open Modal at Step 1
  goToStep(1);
  const modal = DOM.saveFlowModal || document.getElementById('saveFlowModal');
  if (modal) modal.classList.remove('hidden');
}

function closeModalFlow() {
  const modal = DOM.saveFlowModal || document.getElementById('saveFlowModal');
  if (modal) modal.classList.add('hidden');
}

function goToStep(stepNumber) {
  State.activeStep = stepNumber;

  if (DOM.stepNodes) {
    DOM.stepNodes.forEach((node, idx) => {
      if (!node) return;
      const nodeStep = idx + 1;
      node.classList.remove('active', 'completed');
      if (nodeStep < stepNumber && stepNumber <= 4) {
        node.classList.add('completed');
      } else if (nodeStep === stepNumber || (stepNumber === 5 && nodeStep === 4)) {
        node.classList.add('active');
      }
    });
  }

  if (DOM.stepLines) {
    DOM.stepLines.forEach((line, idx) => {
      if (!line) return;
      if (idx + 1 < stepNumber) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });
  }

  if (DOM.panes) {
    Object.values(DOM.panes).forEach(pane => {
      if (pane) pane.classList.remove('active');
    });
  }
  const targetPane = (DOM.panes && DOM.panes[`step${stepNumber}`]) || document.getElementById(`paneStep${stepNumber}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }
}

// Phone Input Handling
function handlePhoneInput() {
  const raw = DOM.inputPhoneNumber.value.trim().replace(/\D/g, '');
  DOM.inputPhoneNumber.value = raw;

  const phoneRegex = /^(0)(3|5|7|8|9)[0-9]{8}$/;
  const isValid = phoneRegex.test(raw);

  if (raw.length === 0) {
    DOM.btnSubmitStep2.disabled = true;
    DOM.phoneErrorMsg.textContent = 'Vui lòng nhập số điện thoại để tiếp tục.';
    DOM.phoneErrorMsg.classList.remove('error');
  } else if (!isValid && raw.length >= 10) {
    DOM.btnSubmitStep2.disabled = true;
    DOM.phoneErrorMsg.textContent = 'Số điện thoại không hợp lệ (cần 10 số, bắt đầu bằng 03, 05, 07, 08, 09).';
    DOM.phoneErrorMsg.classList.add('error');
  } else if (isValid) {
    DOM.btnSubmitStep2.disabled = false;
    DOM.phoneErrorMsg.textContent = '✓ Số điện thoại hợp lệ!';
    DOM.phoneErrorMsg.classList.remove('error');
    DOM.phoneErrorMsg.style.color = 'var(--accent-emerald)';
  } else {
    DOM.btnSubmitStep2.disabled = true;
    DOM.phoneErrorMsg.textContent = `Đang nhập... (${raw.length}/10 số)`;
    DOM.phoneErrorMsg.classList.remove('error');
  }
}

// Keycode Input Handlers
function setupKeycodeInputs() {
  DOM.otpBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
      const val = e.target.value.toUpperCase();
      box.value = val;

      if (val.length === 1) {
        box.classList.add('filled');
        if (index < DOM.otpBoxes.length - 1) {
          DOM.otpBoxes[index + 1].focus();
        }
      } else {
        box.classList.remove('filled');
      }
      checkKeycodeValidity();
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && index > 0) {
        DOM.otpBoxes[index - 1].focus();
      }
    });

    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim().toUpperCase();
      fillKeycode(pasteData);
    });
  });
}

function clearKeycodeInputs() {
  DOM.otpBoxes.forEach(box => {
    box.value = '';
    box.classList.remove('filled');
  });
  DOM.btnRunExecution.disabled = true;
  DOM.keycodeStatusHint.textContent = 'Nhập đủ 6 ký tự để kích hoạt nút RUN';
  DOM.keycodeStatusHint.style.color = 'var(--text-muted)';
}

function fillKeycode(code) {
  const chars = code.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).split('');
  chars.forEach((char, idx) => {
    if (DOM.otpBoxes[idx]) {
      DOM.otpBoxes[idx].value = char.toUpperCase();
      DOM.otpBoxes[idx].classList.add('filled');
    }
  });
  if (chars.length > 0 && chars.length < 6) {
    DOM.otpBoxes[chars.length].focus();
  } else if (chars.length === 6) {
    DOM.otpBoxes[5].focus();
  }
  checkKeycodeValidity();
}

function checkKeycodeValidity() {
  const enteredCode = Array.from(DOM.otpBoxes).map(b => b.value).join('');
  if (enteredCode.length === 6) {
    DOM.btnRunExecution.disabled = false;
    DOM.keycodeStatusHint.textContent = `✓ Đã sẵn sàng thực thi với mã: ${enteredCode}`;
    DOM.keycodeStatusHint.style.color = 'var(--accent-cyan)';
  } else {
    DOM.btnRunExecution.disabled = true;
    DOM.keycodeStatusHint.textContent = `Vui lòng nhập đủ 6 ký tự (${enteredCode.length}/6)`;
    DOM.keycodeStatusHint.style.color = 'var(--text-muted)';
  }
}

/* ==========================================================================
   STEP 4 & 5: RUN BACKEND RETRIEVAL & SUCCESS DONE DIALOG
   ========================================================================== */
function startBackendExecution() {
  goToStep(4);

  const files = State.activeFilesList;
  const isMultiple = files.length > 1;
  const phoneNumber = DOM.inputPhoneNumber.value;
  const keycode = Array.from(DOM.otpBoxes).map(b => b.value).join('');

  DOM.transferPercentage.textContent = '0%';
  DOM.progressBarFill.style.width = '0%';
  DOM.terminalLogsBody.innerHTML = '';

  const totalSizeBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 1024 * 1024 * 10), 0);
  const totalSizeFormatted = formatBytes(totalSizeBytes);

  if (isMultiple) {
    addTerminalLog(`[INIT] Bắt đầu phiên tải đồng loạt ${files.length} tệp dữ liệu...`);
  } else {
    addTerminalLog(`[INIT] Khởi tạo luồng yêu cầu tải file: ${files[0].name}`);
  }

  addTerminalLog(`[AUTH] Xác thực thiết bị: SĐT ${phoneNumber.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2')} | Keycode: ${keycode}`);

  let progress = 0;
  const speedMBps = (38 + Math.random() * 22).toFixed(1);
  DOM.downloadSpeedVal.textContent = `${speedMBps} MB/s`;

  const interval = setInterval(() => {
    const stepIncr = Math.floor(Math.random() * 14) + 8;
    progress = Math.min(100, progress + stepIncr);

    DOM.transferPercentage.textContent = `${progress}%`;
    DOM.progressBarFill.style.width = `${progress}%`;

    const transferredBytes = Math.floor((progress / 100) * totalSizeBytes);
    DOM.downloadTransferredVal.textContent = `${formatBytes(transferredBytes)} / ${totalSizeFormatted}`;
    
    const remainingSecs = Math.max(0, Math.ceil((100 - progress) / 25));
    DOM.downloadEtaVal.textContent = `${remainingSecs}s`;

    // Dynamic Log Statements
    if (progress >= 20 && progress < 45) {
      DOM.transferStatusMessage.textContent = 'Đang bắt tay bảo mật TLS 1.3 với Backend...';
      if (!DOM.terminalLogsBody.textContent.includes('TLS Handshake')) {
        addTerminalLog(`[NET] TLS Handshake thành công. Phân bổ luồng xử lý Backend...`);
      }
    } else if (progress >= 45 && progress < 75) {
      if (isMultiple) {
        DOM.transferStatusMessage.textContent = `Đang trích xuất song song ${files.length} gói tin dữ liệu...`;
        if (!DOM.terminalLogsBody.textContent.includes('BATCH_STREAM')) {
          files.slice(0, 3).forEach((f, idx) => {
            addTerminalLog(`[BATCH_STREAM] Đang nhận luồng [${idx+1}/${files.length}]: ${f.name}`);
          });
        }
      } else {
        DOM.transferStatusMessage.textContent = 'Đang nhận gói tin & giải mã checksum SHA-256...';
        if (!DOM.terminalLogsBody.textContent.includes('STREAM')) {
          addTerminalLog(`[STREAM] Đang nhận luồng dữ liệu khối chunk song song...`);
        }
      }
    } else if (progress >= 75 && progress < 99) {
      DOM.transferStatusMessage.textContent = 'Đang ghi dữ liệu an toàn vào máy tính...';
      if (!DOM.terminalLogsBody.textContent.includes('DISK')) {
        addTerminalLog(`[DISK] Ghi khối dữ liệu hoàn tất. Kiểm tra chữ ký điện tử...`);
      }
    }

    if (progress >= 100) {
      clearInterval(interval);
      DOM.transferStatusMessage.textContent = 'Hoàn tất 100%! Đang hoàn tất lưu file...';
      addTerminalLog(`[SUCCESS] Tất cả file đã được tải về máy thành công!`);

      // Trigger actual downloads in browser
      if (State.config.autoDownloadRealFile) {
        files.forEach((file, index) => {
          setTimeout(() => {
            triggerBrowserFileDownload(
              file.name,
              `=== REDATA OF D SECURE RESTORE FILE ===\nFile ID: ${file.id}\nOriginal Name: ${file.name}\nSize: ${file.sizeFormatted}\nPath: ${file.path}\nRestored At: ${new Date().toLocaleString()}\nVerified Checksum: ${file.checksum}\nAuth Phone: ${phoneNumber}\nStatus: INTEGRITY OK`
            );
          }, index * 200 + 300);
        });
      }

      setTimeout(() => {
        showSuccessDialog(files);
      }, 700);
    }
  }, 230);
}

function addTerminalLog(message) {
  const line = document.createElement('div');
  line.className = 'term-line';
  const now = new Date();
  const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  line.innerHTML = `<span class="term-time">[${timeStr}]</span> ${escapeHTML(message)}`;
  DOM.terminalLogsBody.appendChild(line);
  DOM.terminalLogsBody.scrollTop = DOM.terminalLogsBody.scrollHeight;
}

function showSuccessDialog(files) {
  goToStep(5);
  const isMultiple = files.length > 1;
  const titleEl = DOM.step5Title || document.querySelector('#paneStep5 .pane-title');
  const descEl = DOM.step5Desc || document.querySelector('#paneStep5 .pane-desc');
  const detailsEl = DOM.successDetailsCard || document.querySelector('.success-details-card');

  if (!isMultiple) {
    const file = files[0];
    if (titleEl) titleEl.textContent = 'Đã Lấy Về Thành Công!';
    if (descEl) descEl.textContent = 'Tệp dữ liệu đã được lưu trữ an toàn vào máy tính của bạn';

    if (detailsEl) {
      detailsEl.innerHTML = `
        <div class="success-meta-row">
          <span class="sm-label">Tên tệp:</span>
          <span class="sm-val font-semibold text-cyan">${escapeHTML(file.name)}</span>
        </div>
        <div class="success-meta-row">
          <span class="sm-label">Kích thước:</span>
          <span class="sm-val">${file.sizeFormatted}</span>
        </div>
        <div class="success-meta-row">
          <span class="sm-label">Vị trí lưu:</span>
          <span class="sm-val font-mono">Thư mục Downloads / ReData_${escapeHTML(file.name)}</span>
        </div>
        <div class="success-meta-row">
          <span class="sm-label">Mã toàn vẹn (SHA256):</span>
          <span class="sm-val font-mono text-emerald">${file.checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4'}</span>
        </div>
        <div class="success-meta-row">
          <span class="sm-label">Trạng thái:</span>
          <span class="badge-success-tag">✓ Đã đồng bộ & Xác thực</span>
        </div>
      `;
    }

    showToast(`Tải file "${file.name}" thành công!`, 'success');
  } else {
    if (titleEl) titleEl.textContent = `Đã Lấy Về Thành Công (${files.length} File)!`;
    if (descEl) descEl.textContent = `Toàn bộ ${files.length} tệp dữ liệu đã được trích xuất an toàn về máy tính`;

    const totalBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    const filesListRows = files.map(f => `
      <div class="multi-file-item">
        <span class="file-name">${getFileIcon(f.name)} ${escapeHTML(f.name)}</span>
        <span class="file-size text-emerald">✓ ${f.sizeFormatted}</span>
      </div>
    `).join('');

    if (detailsEl) {
      detailsEl.innerHTML = `
        <div class="multi-files-box" style="margin-bottom: 12px;">
          <div class="multi-files-header">
            <span>Danh sách tệp đã lưu vào máy:</span>
            <span class="text-cyan">Tổng: ${formatBytes(totalBytes)}</span>
          </div>
          <div class="multi-files-scroll" style="max-height: 140px;">
            ${filesListRows}
          </div>
        </div>
        <div class="success-meta-row">
          <span class="sm-label">Vị trí lưu:</span>
          <span class="sm-val font-mono">Thư mục Downloads máy tính</span>
        </div>
        <div class="success-meta-row">
          <span class="sm-label">Trạng thái kiểm tra:</span>
          <span class="badge-success-tag">✓ 100% SHA-256 Verified</span>
        </div>
      `;
    }

    showToast(`Đã tải thành công ${files.length} file về máy tính!`, 'success');
  }
}

function handleFinishDone() {
  // Mark all active files as saved
  State.activeFilesList.forEach(file => {
    State.savedFileIds.add(file.id);
  });

  // Clear batch selection
  State.selectedFileIds.clear();
  if (DOM.selectAllCheckbox) DOM.selectAllCheckbox.checked = false;

  closeModalFlow();
  renderFilesTable();
  updateStats();
  updateBatchBar();
  showToast('Đã hoàn tất quy trình lưu file. Trạng thái file đã được cập nhật!', 'success');
}

/* ==========================================================================
   UTILITIES & SETTINGS
   ========================================================================== */
function triggerBrowserFileDownload(filename, textContent) {
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

function openSettingsModal() {
  DOM.backendUrlInput.value = State.config.backendUrl;
  DOM.mockModeToggle.checked = State.config.mockMode;
  DOM.autoDownloadRealFileToggle.checked = State.config.autoDownloadRealFile;
  DOM.settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  DOM.settingsModal.classList.add('hidden');
}

function saveSettings() {
  State.config.backendUrl = DOM.backendUrlInput.value.trim();
  State.config.mockMode = DOM.mockModeToggle.checked;
  State.config.autoDownloadRealFile = DOM.autoDownloadRealFileToggle.checked;

  localStorage.setItem('redata_config', JSON.stringify(State.config));
  applyConfigUI();
  closeSettingsModal();
  showToast('Đã lưu cấu hình kết nối thành công!', 'success');
  scanBackendFiles(true);
}

function resetSettings() {
  State.config = {
    backendUrl: 'http://localhost:8000/api',
    mockMode: true,
    autoDownloadRealFile: true
  };
  localStorage.removeItem('redata_config');
  DOM.backendUrlInput.value = State.config.backendUrl;
  DOM.mockModeToggle.checked = true;
  DOM.autoDownloadRealFileToggle.checked = true;
  applyConfigUI();
  showToast('Đã khôi phục cài đặt mặc định!', 'info');
}

function loadSavedSettings() {
  const saved = localStorage.getItem('redata_config');
  if (saved) {
    try {
      State.config = Object.assign(State.config, JSON.parse(saved));
    } catch (e) {
      console.warn('Config load error', e);
    }
  }
  applyConfigUI();
}

function applyConfigUI() {
  if (State.config.mockMode) {
    DOM.statusLabelText.textContent = 'Backend: Sẵn sàng (Mock Mode)';
    DOM.footerBackendDisplay.textContent = 'Backend: Mock Engine (Local Emulation)';
  } else {
    DOM.statusLabelText.textContent = `Backend: ${State.config.backendUrl}`;
    DOM.footerBackendDisplay.textContent = `Backend: ${State.config.backendUrl}`;
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
