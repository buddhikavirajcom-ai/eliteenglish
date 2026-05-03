<section class="page-section stack">
    <div><p class="eyebrow">Payments</p><h1><?= $mode === 'admin' ? 'Payment tracking' : 'Payment history' ?></h1></div>
    <?php if ($mode === 'admin'): ?>
        <div class="card">
            <h2>Record payment</h2>
            <form method="post" action="<?= app_base_url('dashboard/payments') ?>">
                <?= \PhpLms\Core\Csrf::field() ?>
                <div class="field"><label>Student</label><select name="student_id"><?php foreach ($students as $student): ?><option value="<?= app_h((string) $student['id']) ?>"><?= app_h((string) $student['name']) ?></option><?php endforeach; ?></select></div>
                <div class="field"><label>Amount</label><input type="number" step="0.01" name="amount" required></div>
                <div class="field"><label>Type</label><select name="type"><option value="MONTHLY">Monthly</option><option value="CLASS">Class</option></select></div>
                <div class="field"><label>Method</label><select name="method"><option value="CASH">Cash</option><option value="ONLINE">Online</option></select></div>
                <div class="field"><label>Status</label><select name="status"><option value="PAID">Paid</option><option value="PENDING">Pending</option></select></div>
                <div class="field"><label>Date</label><input type="date" name="date" value="<?= date('Y-m-d') ?>"></div>
                <button type="submit">Save payment</button>
            </form>
        </div>
    <?php endif; ?>
    <div class="card">
        <table>
            <thead><tr><?php if ($mode === 'admin'): ?><th>Student</th><?php endif; ?><th>Date</th><th>Amount</th><th>Type</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
            <?php foreach ($payments as $payment): ?>
                <tr>
                    <?php if ($mode === 'admin'): ?><td><?= app_h((string) $payment['student_name']) ?></td><?php endif; ?>
                    <td><?= app_date((string) $payment['date']) ?></td>
                    <td><?= app_currency($payment['amount']) ?></td>
                    <td><?= app_h((string) $payment['type']) ?></td>
                    <td><?= app_h((string) $payment['method']) ?></td>
                    <td><?= app_status_badge((string) $payment['status']) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

