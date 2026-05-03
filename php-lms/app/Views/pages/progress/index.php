<section class="page-section stack">
    <div><p class="eyebrow">Progress</p><h1><?= $mode === 'admin' ? 'Monthly progress tracking' : 'Your progress reports' ?></h1></div>
    <?php if ($mode === 'admin'): ?>
        <div class="card">
            <h2>Create or update a monthly entry</h2>
            <form method="post" action="<?= app_base_url('dashboard/progress') ?>">
                <?= \PhpLms\Core\Csrf::field() ?>
                <div class="field"><label>Student</label><select name="student_id"><?php foreach ($students as $student): ?><option value="<?= app_h((string) $student['id']) ?>"><?= app_h((string) $student['name']) ?></option><?php endforeach; ?></select></div>
                <div class="field"><label>Month</label><input type="month" name="month" required></div>
                <div class="field"><label>Listening</label><input type="number" min="1" max="5" name="listening" value="3"></div>
                <div class="field"><label>Reading</label><input type="number" min="1" max="5" name="reading" value="3"></div>
                <div class="field"><label>Writing</label><input type="number" min="1" max="5" name="writing" value="3"></div>
                <div class="field"><label>Speaking</label><input type="number" min="1" max="5" name="speaking" value="3"></div>
                <div class="field"><label>Test mark</label><input type="number" min="0" max="100" name="test_mark"></div>
                <div class="field"><label>Comment</label><textarea name="comment"></textarea></div>
                <button type="submit">Save progress entry</button>
            </form>
        </div>
    <?php endif; ?>
    <div class="card">
        <table>
            <thead><tr><?php if ($mode === 'admin'): ?><th>Student</th><?php endif; ?><th>Month</th><th>Scores</th><th>Comment</th></tr></thead>
            <tbody>
            <?php foreach ($entries as $entry): ?>
                <tr>
                    <?php if ($mode === 'admin'): ?><td><?= app_h((string) $entry['student_name']) ?></td><?php endif; ?>
                    <td><?= app_date((string) $entry['month'], 'M Y') ?></td>
                    <td>L <?= (int) $entry['listening'] ?> | R <?= (int) $entry['reading'] ?> | W <?= (int) $entry['writing'] ?> | S <?= (int) $entry['speaking'] ?><?php if ($entry['test_mark'] !== null): ?><br>Test: <?= (int) $entry['test_mark'] ?><?php endif; ?></td>
                    <td><?= app_h((string) ($entry['comment'] ?? '-')) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

