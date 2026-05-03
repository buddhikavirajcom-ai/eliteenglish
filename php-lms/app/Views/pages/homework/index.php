<?php if ($mode === 'admin'): ?>
    <section class="page-section stack">
        <div><p class="eyebrow">Homework</p><h1>Homework creation and review</h1></div>
        <div class="two-col">
            <div class="card">
                <h2>Create homework</h2>
                <form method="post" enctype="multipart/form-data" action="<?= app_base_url('dashboard/homework') ?>">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <input type="hidden" name="action" value="create_homework">
                    <div class="field"><label>Class</label><select name="class_id"><?php foreach ($classes as $class): ?><option value="<?= app_h((string) $class['id']) ?>"><?= app_h((string) $class['title']) ?></option><?php endforeach; ?></select></div>
                    <div class="field"><label>Title</label><input name="title" required></div>
                    <div class="field"><label>Description</label><textarea name="description"></textarea></div>
                    <div class="field"><label>Deadline</label><input type="date" name="deadline" value="<?= date('Y-m-d', strtotime('+7 day')) ?>"></div>
                    <div class="field"><label>Attachment</label><input type="file" name="attachment"></div>
                    <button type="submit">Create homework</button>
                </form>
            </div>
            <div class="card">
                <h2>Homework list</h2>
                <?php foreach ($homework as $item): ?>
                    <div class="card soft">
                        <strong><?= app_h($item['title']) ?></strong>
                        <p><?= app_h($item['class_title']) ?> | Due <?= app_date((string) $item['deadline']) ?></p>
                        <?php if (!empty($item['attachment_path'])): ?><a class="button secondary" href="<?= app_public_upload_url((string) $item['attachment_path']) ?>">Download attachment</a><?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="card">
            <h2>Homework submissions</h2>
            <table>
                <thead><tr><th>Student</th><th>Homework</th><th>Status</th><th>File</th><th>Review</th></tr></thead>
                <tbody>
                <?php foreach ($submissions as $submission): ?>
                    <tr>
                        <td><?= app_h((string) $submission['student_name']) ?></td>
                        <td><?= app_h((string) $submission['homework_title']) ?></td>
                        <td><?= app_status_badge((string) $submission['status']) ?></td>
                        <td><?php if (!empty($submission['response_path'])): ?><a class="button secondary" href="<?= app_public_upload_url((string) $submission['response_path']) ?>">Download</a><?php endif; ?></td>
                        <td>
                            <form method="post" action="<?= app_base_url('dashboard/homework') ?>">
                                <?= \PhpLms\Core\Csrf::field() ?>
                                <input type="hidden" name="action" value="review_submission">
                                <input type="hidden" name="submission_id" value="<?= app_h((string) $submission['id']) ?>">
                                <div class="field"><select name="status"><option value="SUBMITTED">Submitted</option><option value="REVIEWED">Reviewed</option></select></div>
                                <div class="field"><input type="number" name="score" placeholder="Score"></div>
                                <div class="field"><input type="number" name="max_score" placeholder="Max score"></div>
                                <div class="field"><textarea name="feedback" placeholder="Feedback"></textarea></div>
                                <button type="submit">Save review</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>
<?php else: ?>
    <section class="page-section stack">
        <div><p class="eyebrow">Homework</p><h1>Your homework tasks</h1></div>
        <?php foreach ($items as $item): ?>
            <div class="card">
                <strong><?= app_h($item['title']) ?></strong>
                <p><?= app_h($item['class_title']) ?> | Due <?= app_date((string) $item['deadline']) ?></p>
                <p>Status: <?= app_status_badge((string) ($item['status'] ?? 'PENDING')) ?></p>
                <?php if (!empty($item['feedback'])): ?><p>Feedback: <?= app_h((string) $item['feedback']) ?></p><?php endif; ?>
                <?php if ($item['score'] !== null): ?><p>Score: <?= (int) $item['score'] ?><?php if ($item['max_score'] !== null): ?>/<?= (int) $item['max_score'] ?><?php endif; ?></p><?php endif; ?>
                <form method="post" enctype="multipart/form-data" action="<?= app_base_url('dashboard/homework') ?>">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <input type="hidden" name="homework_id" value="<?= app_h((string) $item['id']) ?>">
                    <div class="field"><label>Upload response</label><input type="file" name="response_file" required></div>
                    <button type="submit">Submit homework</button>
                </form>
            </div>
        <?php endforeach; ?>
    </section>
<?php endif; ?>

