const createCollegeRecord = (code, name) => {
    const $row = $('<tr>').attr('id', code);
    const $actions = $('<td>').addClass('text-center actions-col');
    const $edit = $('<button>')
        .addClass('btn btn-sm btn-outline-primary me-1 edit-college')
        .attr({ 'data-id': code, 'data-name': name, 'aria-label': 'Edit college', title: 'Edit' })
        .html('<span class="heroicon-url heroicon-url-outline icon-pencil-square" aria-hidden="true"></span>');
    const $del = $('<button>')
        .addClass('btn btn-sm btn-outline-danger delete-college')
        .attr({ 'data-id': code, 'aria-label': 'Delete college', title: 'Delete' })
        .html('<span class="heroicon-url heroicon-url-outline icon-trash" aria-hidden="true"></span>');

    $actions.append($edit, $del);
    $row.append($('<td>').text(code), $('<td>').text(name), $actions);

    return $row.prop('outerHTML');
};

async function reloadStudentTable() {
    await loadCsvToTable(csvConfigs[2]);
    refreshDataTable('collegesTable');
}