const createCollegeRecord = (code, name) => {
    const $row = $('<tr>').attr('id', code);
    const $actions = $('<td>').addClass('text-center');
    const $edit = $('<button>').addClass('btn btn-sm btn-outline-primary me-1 edit-college').attr({ 'data-id': code, 'data-name': name }).text('Edit');
    const $del = $('<button>').addClass('btn btn-sm btn-outline-danger delete-college').attr({ 'data-id': code }).text('Delete');

    $actions.append($edit, $del);
    $row.append($('<td>').text(code), $('<td>').text(name), $actions);

    return $row.prop('outerHTML');
};

async function reloadStudentTable() {
    await loadCsvToTable(csvConfigs[2]);
    refreshDataTable('collegesTable');
}