const createCollegeRecord = (code, name) => {
    const $row = $('<tr>').attr('id', code);
    const $actions = $('<td>').addClass('text-center actions-col');
    const $edit = $('<button>').addClass('btn btn-sm btn-outline-primary me-1 edit-college').attr({ 'data-id': code, 'data-name': name, 'aria-label': 'Edit college', title: 'Edit' }).html('<span class="heroicon-url heroicon-url-outline icon-pencil-square" aria-hidden="true"></span>');
    const $del = $('<button>').addClass('btn btn-sm btn-outline-danger delete-college').attr({ 'data-id': code, 'aria-label': 'Delete college', title: 'Delete' }).html('<span class="heroicon-url heroicon-url-outline icon-trash" aria-hidden="true"></span>');

    $actions.append($edit, $del);
    $row.append($('<td>').text(code), $('<td>').text(name), $actions);

    return $row.prop('outerHTML');
};

async function reloadCollegeTable() {
    const $shell = $('#collegesTable').closest('.table-shell');
    $shell.addClass('is-loading');

    try {
        await loadCsvToTable(csvConfigs[2]);
        refreshDataTable('collegesTable');
    } finally {
        $shell.removeClass('is-loading');
    }
}

let collegeRecordsCache = [];

function populateCollegeOptions(records = collegeRecordsCache) {
    if(Array.isArray(records) && records.length) {
        collegeRecordsCache = records;
    }

    const sourceRecords = Array.isArray(records) ? records : collegeRecordsCache;
    const $select = $('#program-college');
    const codes = Array.from(new Set(sourceRecords.map(([code]) => code))).sort();
    const collegeOptionsTemplate = [$('<option>').attr({ value: '', selected: true, disabled: true }).text('Select college code'), ...codes.map((code) => $('<option>').attr({ value: code }).text(code))];

    if(!$select.length) return;

    $select.empty().append(collegeOptionsTemplate.map((option) => option.clone()));
}

function openCollegeModal(mode, data = {}) {
    const $modal = $('#collegeModal');
    if(!$modal.length) return;

    const $form = $('#college-form');
    const $title = $('#collegeModalLabel');
    const $submit = $('#college-submit');

    const isEdit = mode === 'edit';
    $form.attr('data-mode', mode);
    $form.attr('data-id', data.code || '');
    $title.text(isEdit ? 'Edit College' : 'Add College');
    $submit.text(isEdit ? 'Save Changes' : 'Add College');

    $('#college-code').val(data.code || '').attr('placeholder', data.code || '');
    $('#college-name').val(data.name || '').attr('placeholder', data.name || '');

    const ModalClass = window.bootstrap?.Modal;
    if(ModalClass) {
        ModalClass.getOrCreateInstance($modal[0]).show();
    }
}

function openDeleteCollegeModal(collegeId) {
    const $modal = $('#deleteCollegeModal');
    if(!$modal.length) return;

    $('#delete-college-id').val(collegeId || '');

    const ModalClass = window.bootstrap?.Modal;
    if(ModalClass) {
        ModalClass.getOrCreateInstance($modal[0]).show();
    }
}

$(document).on('click', '#btn-refresh-college', () => reloadCollegeTable());

$(document).on('click', '#btn-add-college', () => openCollegeModal('add'));

$(document).on('click', '.edit-college', function() {
    const $btn = $(this);
    openCollegeModal('edit', {
        code: $btn.attr('data-id'),
        name: $btn.attr('data-name'),
    });
});

$(document).on('click', '.delete-college', function() {
    const $btn = $(this);
    openDeleteCollegeModal($btn.attr('data-id'));
});

$(document).on('submit', '#college-form', async function(event) {
    event.preventDefault();

    const $form = $(this);
    const mode = $form.attr('data-mode') || 'add';
    const originalId = $form.attr('data-id') || '';

    const collegeCode = ($('#college-code').val() || '').trim();
    const collegeName = ($('#college-name').val() || '').trim();

    if(!collegeCode || !collegeName) {
        showToast('Please complete all required fields.', 'warning');
        return;
    }

    try {
        const payload = {
            csvPath: csvConfigs[2].csvPath,
            headerLine: csvConfigs[2].headerLine,
            key: mode === 'edit' ? originalId : collegeCode,
            keyIndex: 0,
            rowValues: [collegeCode, collegeName],
            mode,
        };

        const result = await writeCsvRecord(payload);
        if(result.status === 'duplicate') {
            showToast('College code already exists.', 'danger');
            return;
        }

        if(result.status === 'missing') {
            showToast('College record not found.', 'danger');
            return;
        }

        await reloadCollegeTable();

        const modalEl = document.getElementById('collegeModal');
        const modalInstance = modalEl ? window.bootstrap?.Modal?.getInstance(modalEl) : null;
        modalInstance?.hide();
        const successMessage = mode === 'edit'
            ? `College <b>${collegeCode}</b> updated.`
            : `College <b>${collegeCode}</b> added.`;
        showToast(successMessage, 'success');
    } catch (error) {
        const message = error?.message ? `Failed to save college: ${error.message}` : 'Failed to save college.';
        showToast(message, 'danger');
    }
});

$(document).on('click', '#confirm-delete-college', async function() {
    const collegeId = $('#delete-college-id').val() || '';
    if(!collegeId) return;

    try {
        const result = await deleteCsvRecord({
            csvPath: csvConfigs[2].csvPath,
            headerLine: csvConfigs[2].headerLine,
            key: collegeId,
            keyIndex: 0,
        });

        if(result.status === 'missing') {
            showToast('College record not found.', 'danger');
            return;
        }

        await reloadCollegeTable();

        const modalEl = document.getElementById('deleteCollegeModal');
        const modalInstance = modalEl ? window.bootstrap?.Modal?.getInstance(modalEl) : null;
        modalInstance?.hide();
        showToast(`College <b>${collegeId}</b> deleted.`, 'success');
    } catch (error) {
        const message = error?.message ? `Failed to delete college: ${error.message}` : 'Failed to delete college.';
        showToast(message, 'danger');
    }
});