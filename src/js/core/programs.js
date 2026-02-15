const createProgramRecord = (code, name, college) => {
    const $row = $('<tr>').attr('id', code);
    const $actions = $('<td>').addClass('text-center actions-col');
    const $edit = $('<button>')
        .addClass('btn btn-sm btn-outline-primary me-1 edit-program')
        .attr({ 'data-id': code, 'data-name': name, 'data-college': college, 'aria-label': 'Edit program', title: 'Edit' })
        .html('<span class="heroicon-url heroicon-url-outline icon-pencil-square" aria-hidden="true"></span>');
    const $del = $('<button>')
        .addClass('btn btn-sm btn-outline-danger delete-program')
        .attr({ 'data-id': code, 'aria-label': 'Delete program', title: 'Delete' })
        .html('<span class="heroicon-url heroicon-url-outline icon-trash" aria-hidden="true"></span>');

    $actions.append($edit, $del);
    $row.append($('<td>').text(code), $('<td>').text(name), $('<td>').text(college), $actions);

    return $row.prop('outerHTML');
};

async function reloadProgramTable() {
    await loadCsvToTable(csvConfigs[1]);
    refreshDataTable('programsTable');
}

let programRecordsCache = [];

function populateProgramOptions(records = programRecordsCache) {
    if(Array.isArray(records) && records.length) {
        programRecordsCache = records;
    }

    const sourceRecords = Array.isArray(records) ? records : programRecordsCache;
    const $select = $('#student-program');
    const codes = Array.from(new Set(sourceRecords.map(([code]) => code))).sort();
    const programOptionsTemplate = [$('<option>').attr({ value: '', selected: true, disabled: true }).text('Select program code'), ...codes.map((code) => $('<option>').attr({ value: code }).text(code))];

    if(!$select.length) return;

    $select.empty().append(programOptionsTemplate.map((option) => option.clone()));
}

function openProgramModal(mode, data = {}) {
    const $modal = $('#programModal');
    if(!$modal.length) return;

    const $form = $('#program-form');
    const $title = $('#programModalLabel');
    const $submit = $('#program-submit');

    const isEdit = mode === 'edit';
    $form.attr('data-mode', mode);
    $form.attr('data-id', data.code || '');
    $title.text(isEdit ? 'Edit Program' : 'Add Program');
    $submit.text(isEdit ? 'Save Changes' : 'Add Program');

    $('#program-code').val(data.code || '').attr('placeholder', data.code || '');
    $('#program-name').val(data.name || '').attr('placeholder', data.name || '');
    
    populateCollegeOptions();

    const $collegeSelect = $('#program-college');
    if(data.college && !$collegeSelect.find(`option[value="${data.college}"]`).length) {
        $collegeSelect.append($('<option>').val(data.college).text(data.college));
    }
    $collegeSelect.val(data.college || '');

    const ModalClass = window.bootstrap?.Modal;
    if(ModalClass) {
        ModalClass.getOrCreateInstance($modal[0]).show();
    }
}

function openDeleteProgramModal(programId) {
    const $modal = $('#deleteProgramModal');
    if(!$modal.length) return;

    $('#delete-program-id').val(programId || '');

    const ModalClass = window.bootstrap?.Modal;
    if(ModalClass) {
        ModalClass.getOrCreateInstance($modal[0]).show();
    }
}

$(document).on('click', '#btn-add-program', () => openProgramModal('add'));

$(document).on('click', '.edit-program', function() {
    const $btn = $(this);
    openProgramModal('edit', {
        code: $btn.attr('data-id'),
        name: $btn.attr('data-name'),
        college: $btn.attr('data-college'),
    });
});

$(document).on('click', '.delete-program', function() {
    const $btn = $(this);
    openDeleteProgramModal($btn.attr('data-id'));
});

$(document).on('submit', '#program-form', async function(event) {
    event.preventDefault();

    const $form = $(this);
    const mode = $form.attr('data-mode') || 'add';
    const originalId = $form.attr('data-id') || '';

    const programCode = ($('#program-code').val() || '').trim();
    const programName = ($('#program-name').val() || '').trim();
    const collegeCode = $('#program-college').val() || '';

    if(!programCode || !programName || !collegeCode) {
        showToast('Please complete all required fields.', 'warning');
        return;
    }

    try {
        const payload = {
            csvPath: csvConfigs[1].csvPath,
            headerLine: csvConfigs[1].headerLine,
            key: mode === 'edit' ? originalId : programCode,
            keyIndex: 0,
            rowValues: [programCode, programName, collegeCode],
            mode,
        };

        const result = await writeCsvRecord(payload);
        if(result.status === 'duplicate') {
            showToast('Program code already exists.', 'danger');
            return;
        }

        if(result.status === 'missing') {
            showToast('Program record not found.', 'danger');
            return;
        }

        await reloadProgramTable();

        const modalEl = document.getElementById('programModal');
        const modalInstance = modalEl ? window.bootstrap?.Modal?.getInstance(modalEl) : null;
        modalInstance?.hide();
        const successMessage = mode === 'edit'
            ? `Program <b>${programCode}</b> updated.`
            : `Program <b>${programCode}</b> added.`;
        showToast(successMessage, 'success');
    } catch (error) {
        const message = error?.message ? `Failed to save program: ${error.message}` : 'Failed to save program.';
        showToast(message, 'danger');
    }
});

$(document).on('click', '#confirm-delete-program', async function() {
    const programId = $('#delete-program-id').val() || '';
    if(!programId) return;

    try {
        const result = await deleteCsvRecord({
            csvPath: csvConfigs[1].csvPath,
            headerLine: csvConfigs[1].headerLine,
            key: programId,
            keyIndex: 0,
        });

        if(result.status === 'missing') {
            showToast('Program record not found.', 'danger');
            return;
        }

        await reloadProgramTable();

        const modalEl = document.getElementById('deleteProgramModal');
        const modalInstance = modalEl ? window.bootstrap?.Modal?.getInstance(modalEl) : null;
        modalInstance?.hide();
        showToast(`Program <b>${programId}</b> deleted.`, 'success');
    } catch (error) {
        const message = error?.message ? `Failed to delete program: ${error.message}` : 'Failed to delete program.';
        showToast(message, 'danger');
    }
});