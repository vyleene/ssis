function initTitleBar() {
    const $titleBar = $('#app-titlebar');
    const $minimizeBtn = $('#btn-minimize');
    const $closeBtn = $('#btn-close');

    if($titleBar.length) Neutralino.window.setDraggableRegion($titleBar[0], { exclude: [$minimizeBtn[0], $closeBtn[0]].filter(Boolean) });
    if($minimizeBtn.length) $minimizeBtn.on('click', async () => Neutralino.window.minimize());
    if($closeBtn.length) $closeBtn.on('click', async () => Neutralino.app.exit());

    Neutralino.events.on('windowClose', () => Neutralino.app.exit());
}

function initDirectoryNav() {
    const $navItems = $('.app-nav__item');
    const $panels = $('.directory-panel');

    $navItems.on('click', function() {
        const target = $(this).attr('data-panel');

        $navItems.removeClass('is-active');
        $(this).addClass('is-active');

        $panels.each((_, panel) => {
            const $panel = $(panel);
            const isActive = $panel.attr('data-panel') === target;
            $panel.toggleClass('is-active', isActive);
        });

        if(typeof $ !== 'undefined' && $.fn.DataTable) $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust().responsive.recalc();
    });
}

function initDataTable(tableId) {
    if(typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') return;

    const $table = $(`#${tableId}`);
    if(!$table.length) return;

    if($.fn.DataTable.isDataTable($table)) $table.DataTable().destroy();

    $table.DataTable({
        responsive: true,
        fixedHeader: true,
        paging: true,
        lengthChange: false,
    });
}

function refreshDataTable(tableId) {
    if(typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') return;

    const $table = $(`#${tableId}`);
    if(!$table.length) return;

    if($.fn.DataTable.isDataTable($table)) {
        const rows = $table.find('tbody tr').toArray();
        const dataTable = $table.DataTable();
        dataTable.clear();
        dataTable.rows.add(rows).draw(false);
    } else {
        initDataTable(tableId);
    }
}

function showToast(message, variant) {
    const $toastContainer = $('.toast-container');
    if(!$toastContainer.length) return;

    const toastDuration = 3000;
    const toastIconByVariant = {
        success: 'icon-check-circle',
        warning: 'icon-exclamation-triangle',
        danger: 'icon-x-circle',
        info: 'icon-information-circle',
    };
    const iconClass = toastIconByVariant[variant] || 'icon-bell';

    const $toastEl = $('<div>').addClass(`toast align-items-center text-bg-${variant} border-0`).attr({ role: 'alert', 'aria-live': 'assertive', 'aria-atomic': 'true' });
    const $toastRow = $('<div>').addClass('d-flex');
    const $toastBody = $('<div>').addClass('toast-body d-flex align-items-center gap-2').html(`<span class="heroicon-url heroicon-url-outline ${iconClass}" aria-hidden="true"></span><span>${message}</span>`);
    const $toastClose = $('<button>').addClass('btn-close btn-close-white me-2 m-auto').attr({ type: 'button', 'data-bs-dismiss': 'toast', 'aria-label': 'Close' });
    const $progress = $('<div>').addClass('toast-progress progress').attr('role', 'presentation');
    const $progressBar = $('<div>').addClass('progress-bar toast-progress__bar').attr('role', 'progressbar');

    $toastRow.append($toastBody, $toastClose);
    $progress.append($progressBar);
    $toastEl.append($toastRow, $progress);

    $toastContainer.append($toastEl);

    $progressBar.css('animation-duration', `${toastDuration}ms`);

    const ToastClass = window.bootstrap?.Toast;
    if(ToastClass) {
        const toast = new ToastClass($toastEl[0], { delay: toastDuration, autohide: true });
        $toastEl.on('hidden.bs.toast', () => $toastEl.remove());
        toast.show();
    } else {
        $toastEl.addClass('show');
        setTimeout(() => $toastEl.remove(), toastDuration);
    }
}

$(document).ready(async () => {
    await Promise.all(csvConfigs.map(config => loadCsvToTable(config)));
    csvConfigs.forEach(config => initDataTable(config.tableId));
    
    initTitleBar();
    initDirectoryNav();

    const refreshConfigMap = new Map([
        ['btn-refresh-student', { configIndex: 0, tableId: 'studentsTable' }],
        ['btn-refresh-program', { configIndex: 1, tableId: 'programsTable' }],
        ['btn-refresh-college', { configIndex: 2, tableId: 'collegesTable' }],
    ]);

    $(document).on('click', '#btn-refresh-student, #btn-refresh-program, #btn-refresh-college', async (event) => {
        const targetId = event.currentTarget?.id;
        const config = refreshConfigMap.get(targetId);
        if(!config) return;

        const $shell = $(`#${config.tableId}`).closest('.table-shell');
        $shell.addClass('is-loading');
        try {
            await loadCsvToTable(csvConfigs[config.configIndex]);
            refreshDataTable(config.tableId);
        } finally {
            $shell.removeClass('is-loading');
        }
    });
});

Neutralino.init();