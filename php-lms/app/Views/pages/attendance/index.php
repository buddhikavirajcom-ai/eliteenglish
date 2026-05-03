<section class="page-section stack">
    <div><p class="eyebrow">Attendance</p><h1><?= $mode === 'admin' ? 'Attendance management' : 'Attendance history' ?></h1></div>
    <?php if ($mode === 'admin'): ?>
        <div class="two-col">
            <div class="card">
                <h2>Manual attendance</h2>
                <form method="post" action="<?= app_base_url('dashboard/attendance') ?>">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <input type="hidden" name="action" value="manual">
                    <div class="field"><label>Student</label><select name="student_id"><?php foreach ($students as $student): ?><option value="<?= app_h((string) $student['id']) ?>"><?= app_h((string) $student['name']) ?></option><?php endforeach; ?></select></div>
                    <div class="field"><label>Date</label><input type="date" name="date" value="<?= date('Y-m-d') ?>"></div>
                    <div class="field"><label>Status</label><select name="status"><option value="PRESENT">Present</option><option value="ABSENT">Absent</option></select></div>
                    <button type="submit">Save attendance</button>
                </form>
            </div>
            <div class="card">
                <h2>QR attendance</h2>
                <form method="post" action="<?= app_base_url('dashboard/attendance') ?>">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <input type="hidden" name="action" value="qr_scan">
                    <div class="field"><label>QR code</label><input name="qr_code" placeholder="Paste student QR code"></div>
                    <div class="field"><label>Date</label><input type="date" name="date" value="<?= date('Y-m-d') ?>"></div>
                    <button type="submit">Mark present</button>
                </form>
            </div>
        </div>
    <?php endif; ?>
    <div class="card">
        <table>
            <thead><tr><?php if ($mode === 'admin'): ?><th>Student</th><?php endif; ?><th>Date</th><th>Status</th></tr></thead>
            <tbody>
            <?php foreach ($records as $record): ?>
                <tr>
                    <?php if ($mode === 'admin'): ?><td><?= app_h((string) $record['student_name']) ?></td><?php endif; ?>
                    <td><?= app_date((string) $record['date']) ?></td>
                    <td><?= app_status_badge((string) $record['status']) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

