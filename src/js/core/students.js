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

    const idDisabled = isEdit;
    $('#student-id-year').prop('disabled', idDisabled);
    $('#student-id-number').prop('disabled', idDisabled);

    const values = {
        id: data.id || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        programCode: data.programCode || '',
        year: data.year || '',
        gender: data.gender || '',
    };

    const [yearPart, numberPart] = values.id.includes('-') ? values.id.split('-') : ['', values.id];
    const defaultYear = isEdit ? yearPart : String(moment?.().year?.() || '');
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

        if(defaultYear && !years.includes(defaultYear)) {
            $idYear.append($('<option>').val(defaultYear).text(defaultYear));
        }

        $idYear.val(defaultYear || '');
    }

    $idNumber.val(numberPart || '');
    $('#student-first-name').val(values.firstName);
    $('#student-last-name').val(values.lastName);
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

$(document).on('click', '#btn-add-student', () => openStudentModal('add'));

$(document).on('click', '.edit-student', function() {
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

$(document).on('click', '.delete-student', function() {
    const $btn = $(this);
    openDeleteStudentModal($btn.attr('data-id'));
});

$(document).on('input', '#student-id-number', function() {
    const raw = $(this).val();
    const digits = (raw || '').replace(/\D/g, '').slice(0, 4);
    $(this).val(digits);
});

$(document).on('blur', '#student-id-number', function() {
    const value = $(this).val();
    if(!value) return;
    $(this).val(value.padStart(4, '0'));
});

$(document).on('input', '#student-first-name, #student-last-name', function() {
    const raw = $(this).val();
    const filtered = (raw || '').replace(/[^A-Za-z ]/g, '').slice(0, 16);
    $(this).val(filtered);
});