const createStudentRecord = (id, f_name, l_name, code, year, gender) => {
    const $row = $('<tr>');
    const $actions = $('<td>').addClass('text-center actions-col');
    const $edit = $('<button>')
        .addClass('btn btn-sm btn-outline-primary me-1 edit-student')
        .attr({ 'data-id': id, 'data-fn': f_name, 'data-ln': l_name, 'data-cd': code, 'data-yr': year, 'data-gr': gender, 'aria-label': 'Edit student', title: 'Edit' })
        .html('<span class="heroicon-url heroicon-url-outline icon-pencil-square" aria-hidden="true"></span>');
    const $del = $('<button>')
        .addClass('btn btn-sm btn-outline-danger delete-student')
        .attr({ 'data-id': id, 'aria-label': 'Delete student', title: 'Delete' })
        .html('<span class="heroicon-url heroicon-url-outline icon-trash" aria-hidden="true"></span>');

    $actions.append($edit, $del);
    $row.append($('<td>').text(id), $('<td>').text(f_name), $('<td>').text(l_name), $('<td>').text(code), $('<td>').text(year), $('<td>').text(gender), $actions);

    return $row.prop('outerHTML');
};

async function reloadStudentTable() {
    await loadCsvToTable(csvConfigs[0]);
    refreshDataTable('studentsTable');
}

function openStudentModal(mode, data = {}) {
    const $modal = $('#studentModal');
    if(!$modal.length) return;

    const $form = $('#student-form');
    const $title = $('#studentModalLabel');
    const $submit = $('#student-submit');

    const isEdit = mode === 'edit';
    const titleText = isEdit ? 'Edit Student' : 'Add Student';
    const submitText = isEdit ? 'Save Changes' : 'Add Student';

    $form.attr('data-mode', mode);
    $title.text(titleText);
    $submit.text(submitText);

    const values = {
        id: data.id || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        programCode: data.programCode || '',
        year: data.year || '',
        gender: data.gender || '',
    };

    const [yearPart, numberPart] = values.id.includes('-') ? values.id.split('-') : ['', values.id];
    const $idYear = $('#student-id-year');
    const $idNumber = $('#student-id-number');

    if($idYear.length && typeof moment !== 'undefined') {
        const currentYear = moment().year();
        const years = [];
        for(let year = currentYear; year >= currentYear - 5; year -= 1) {
            years.push(String(year));
        }

        $idYear.empty().append(
            $('<option>').attr({ value: '', selected: true, disabled: true }).text('YYYY'),
            ...years.map((year) => $('<option>').val(year).text(year))
        );

        if(yearPart && !years.includes(yearPart)) {
            $idYear.append($('<option>').val(yearPart).text(yearPart));
        }

        $idYear.val(yearPart || '');
    }

    $idNumber.val(numberPart || '').attr('placeholder', numberPart || '');
    $('#student-first-name').val(values.firstName).attr('placeholder', values.firstName || '');
    $('#student-last-name').val(values.lastName).attr('placeholder', values.lastName || '');
    const $programSelect = $('#student-program');
    const $yearSelect = $('#student-year');
    const $genderSelect = $('#student-gender');

    populateProgramOptions();

    if(values.programCode && !$programSelect.find(`option[value="${values.programCode}"]`).length) {
        $programSelect.append($('<option>').val(values.programCode).text(values.programCode));
    }

    $programSelect.val(values.programCode || '');
    $yearSelect.val(values.year || '');
    $genderSelect.val(values.gender || '');

    const ModalClass = window.bootstrap?.Modal;
    if(ModalClass) {
        ModalClass.getOrCreateInstance($modal[0]).show();
    }
}

function openDeleteStudentModal(studentId) {
    const $modal = $('#deleteStudentModal');
    if(!$modal.length) return;

    $('#delete-student-id').val(studentId || '');

    const ModalClass = window.bootstrap?.Modal;
    if(ModalClass) {
        ModalClass.getOrCreateInstance($modal[0]).show();
    }
}

$('#btn-add-student').on('click', () => openStudentModal('add'));

$('.edit-student').on('click', function() {
    const $btn = $(this);
    openStudentModal('edit', {
        id: $btn.attr('data-id'),
        firstName: $btn.attr('data-fn'),
        lastName: $btn.attr('data-ln'),
        programCode: $btn.attr('data-cd'),
        year: $btn.attr('data-yr'),
        gender: $btn.attr('data-gr'),
    });
});

$('.delete-student').on('click', function() {
    const $btn = $(this);
    openDeleteStudentModal($btn.attr('data-id'));
});