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