const createStudentRecord = (id, f_name, l_name, code, year, gender) => {
    const $row = $('<tr>');
    const $actions = $('<td>').addClass('text-center');
    const $edit = $('<button>').addClass('btn btn-sm btn-outline-primary me-1 edit-student').attr({ 'data-id': id, 'data-fn': f_name, 'data-ln': l_name, 'data-cd': code, 'data-yr': year, 'data-gr': gender }).text('Edit');
    const $del = $('<button>').addClass('btn btn-sm btn-outline-danger delete-student').attr({ 'data-id': id }).text('Delete');

    $actions.append($edit, $del);
    $row.append($('<td>').text(id), $('<td>').text(f_name), $('<td>').text(l_name), $('<td>').text(code), $('<td>').text(year), $('<td>').text(gender), $actions);

    return $row.prop('outerHTML');
};

async function reloadStudentTable() {
    await loadCsvToTable(csvConfigs[0]);
    refreshDataTable('studentsTable');
}