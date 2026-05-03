<?php if ($mode === 'admin'): ?>
    <section class="page-section stack">
        <div><p class="eyebrow">Classes</p><h1>Class scheduling and enrollment review</h1></div>
        <div class="two-col">
            <div class="card">
                <h2><?= $editClass ? 'Edit class' : 'Create class' ?></h2>
                <form method="post" action="<?= app_base_url('dashboard/classes') ?>">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <input type="hidden" name="action" value="<?= $editClass ? 'update' : 'create' ?>">
                    <input type="hidden" name="class_id" value="<?= app_h((string) ($editClass['id'] ?? '')) ?>">
                    <div class="field"><label>Title</label><input name="title" value="<?= app_h((string) ($editClass['title'] ?? '')) ?>" required></div>
                    <div class="field"><label>Subject</label><input name="subject" value="<?= app_h((string) ($editClass['subject'] ?? '')) ?>" required></div>
                    <div class="field"><label>Teacher</label><select name="teacher_id"><?php foreach ($teachers as $teacher): ?><option value="<?= app_h((string) $teacher['id']) ?>" <?= !empty($editClass['teacher_id']) && $editClass['teacher_id'] === $teacher['id'] ? 'selected' : '' ?>><?= app_h((string) $teacher['name']) ?></option><?php endforeach; ?></select></div>
                    <div class="field"><label>Level</label><input name="level" value="<?= app_h((string) ($editClass['level'] ?? '')) ?>" required></div>
                    <div class="field"><label>Type</label><select name="type"><option value="ONLINE" <?= ($editClass['type'] ?? '') === 'ONLINE' ? 'selected' : '' ?>>Online</option><option value="OFFLINE" <?= ($editClass['type'] ?? '') === 'OFFLINE' ? 'selected' : '' ?>>Offline</option></select></div>
                    <div class="field"><label>Status</label><select name="status"><?php foreach (['DRAFT','ACTIVE','COMPLETED','CANCELLED'] as $status): ?><option value="<?= $status ?>" <?= ($editClass['status'] ?? 'ACTIVE') === $status ? 'selected' : '' ?>><?= $status ?></option><?php endforeach; ?></select></div>
                    <div class="field"><label>Date</label><input type="date" name="date" value="<?= app_h((string) ($editClass['date'] ?? date('Y-m-d'))) ?>"></div>
                    <div class="field"><label>Schedule day</label><select name="schedule_day"><?php foreach (['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] as $day): ?><option value="<?= $day ?>" <?= ($editClass['schedule_day'] ?? '') === $day ? 'selected' : '' ?>><?= $day ?></option><?php endforeach; ?></select></div>
                    <div class="field"><label>Start time</label><input type="time" name="start_time" value="<?= app_h((string) ($editClass['start_time'] ?? '09:00')) ?>"></div>
                    <div class="field"><label>End time</label><input type="time" name="end_time" value="<?= app_h((string) ($editClass['end_time'] ?? '10:00')) ?>"></div>
                    <div class="field"><label>Meeting link</label><input name="meeting_link" value="<?= app_h((string) ($editClass['meeting_link'] ?? '')) ?>"></div>
                    <div class="field"><label>Location</label><input name="location" value="<?= app_h((string) ($editClass['location'] ?? '')) ?>"></div>
                    <div class="field"><label>Capacity</label><input type="number" name="capacity" value="<?= app_h((string) ($editClass['capacity'] ?? 20)) ?>"></div>
                    <div class="field"><label>Fee</label><input type="number" step="0.01" name="fee" value="<?= app_h((string) ($editClass['fee'] ?? 0)) ?>"></div>
                    <div class="field"><label>Notes</label><textarea name="notes"><?= app_h((string) ($editClass['notes'] ?? '')) ?></textarea></div>
                    <div class="field">
                        <label>Assign students</label>
                        <select name="student_ids[]" multiple size="8">
                            <?php foreach ($students as $student): ?>
                                <option value="<?= app_h((string) $student['id']) ?>" <?= in_array($student['id'], $editStudentIds, true) ? 'selected' : '' ?>><?= app_h((string) $student['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="actions">
                        <button type="submit"><?= $editClass ? 'Update class' : 'Create class' ?></button>
                        <?php if ($editClass): ?><a class="button secondary" href="<?= app_base_url('dashboard/classes') ?>">Cancel</a><?php endif; ?>
                    </div>
                </form>
            </div>
            <div class="card">
                <h2>Current classes</h2>
                <table>
                    <thead><tr><th>Class</th><th>Teacher</th><th>Date</th><th>Students</th><th>Actions</th></tr></thead>
                    <tbody>
                    <?php foreach ($classes as $class): ?>
                        <tr>
                            <td><strong><?= app_h($class['title']) ?></strong><br><?= app_h($class['subject']) ?> - <?= app_h($class['level']) ?><br><?= app_status_badge((string) $class['status']) ?></td>
                            <td><?= app_h((string) $class['teacher_name']) ?></td>
                            <td><?= app_date((string) $class['date']) ?><br><?= app_h((string) $class['start_time']) ?> - <?= app_h((string) $class['end_time']) ?></td>
                            <td><?= (int) $class['enrolled_count'] ?>/<?= (int) $class['capacity'] ?></td>
                            <td class="actions">
                                <a class="button secondary" href="<?= app_base_url('dashboard/classes?edit=' . urlencode((string) $class['id'])) ?>">Edit</a>
                                <form method="post" action="<?= app_base_url('dashboard/classes') ?>" onsubmit="return confirm('Delete this class?');">
                                    <?= \PhpLms\Core\Csrf::field() ?>
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="class_id" value="<?= app_h((string) $class['id']) ?>">
                                    <button type="submit">Delete</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <h2>Public enrollment requests</h2>
            <table>
                <thead><tr><th>Student</th><th>Class</th><th>Status</th><th>Slip</th><th>Review</th></tr></thead>
                <tbody>
                <?php foreach ($enrollmentRequests as $request): ?>
                    <tr>
                        <td><?= app_h($request['student_name']) ?><br><?= app_h($request['student_phone']) ?></td>
                        <td><?= app_h($request['class_title']) ?><br><?= app_currency($request['fee']) ?></td>
                        <td><?= app_status_badge((string) $request['status']) ?></td>
                        <td>
                            <?php if (!empty($request['payment_slip_path'])): ?>
                                <a class="button secondary" href="<?= app_public_upload_url((string) $request['payment_slip_path']) ?>">Download slip</a>
                            <?php else: ?>
                                <span class="muted">No slip yet</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <form method="post" action="<?= app_base_url('dashboard/classes') ?>">
                                <?= \PhpLms\Core\Csrf::field() ?>
                                <input type="hidden" name="action" value="review_request">
                                <input type="hidden" name="request_id" value="<?= app_h((string) $request['id']) ?>">
                                <div class="field"><textarea name="review_note" placeholder="Optional note"></textarea></div>
                                <div class="actions">
                                    <button type="submit" name="decision" value="APPROVE">Approve</button>
                                    <button type="submit" class="secondary" name="decision" value="REJECT">Reject</button>
                                </div>
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
        <div><p class="eyebrow">Classes</p><h1>Your assigned classes</h1></div>
        <?php foreach ($classes as $class): ?>
            <div class="card">
                <strong><?= app_h($class['title']) ?></strong>
                <p><?= app_h($class['subject']) ?> - <?= app_h($class['level']) ?></p>
                <p><?= app_date((string) $class['date']) ?> | <?= app_h((string) $class['schedule_day']) ?> | <?= app_h((string) $class['start_time']) ?> - <?= app_h((string) $class['end_time']) ?></p>
                <p>Teacher: <?= app_h((string) $class['teacher_name']) ?></p>
            </div>
        <?php endforeach; ?>
    </section>
<?php endif; ?>

