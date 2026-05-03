<?php if ($mode === 'admin'): ?>
    <section class="page-section stack">
        <div class="toolbar">
            <div><p class="eyebrow">Students</p><h1>Student management</h1></div>
        </div>
        <div class="two-col">
            <div class="card">
                <h2><?= $editStudent ? 'Edit student' : 'Create student' ?></h2>
                <form method="post" action="<?= app_base_url('dashboard/students') ?>">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <input type="hidden" name="action" value="<?= $editStudent ? 'update' : 'create' ?>">
                    <input type="hidden" name="student_id" value="<?= app_h((string) ($editStudent['id'] ?? '')) ?>">
                    <div class="field"><label>Name</label><input name="name" value="<?= app_h((string) ($editStudent['name'] ?? '')) ?>" required></div>
                    <div class="field"><label>Phone</label><input name="phone" value="<?= app_h((string) ($editStudent['phone'] ?? '')) ?>" required></div>
                    <div class="field"><label>Email</label><input type="email" name="email" value="<?= app_h((string) ($editStudent['email'] ?? '')) ?>"></div>
                    <div class="field"><label>Parent name</label><input name="parent_name" value="<?= app_h((string) ($editStudent['parent_name'] ?? '')) ?>" required></div>
                    <div class="field"><label>Parent contact</label><input name="parent_contact" value="<?= app_h((string) ($editStudent['parent_contact'] ?? '')) ?>"></div>
                    <div class="field"><label>Grade</label><input name="grade" value="<?= app_h((string) ($editStudent['grade'] ?? '')) ?>"></div>
                    <div class="field"><label>School</label><input name="school" value="<?= app_h((string) ($editStudent['school'] ?? '')) ?>"></div>
                    <div class="field"><label>Learning level</label><input name="learning_level" value="<?= app_h((string) ($editStudent['learning_level'] ?? '')) ?>"></div>
                    <div class="field"><label>Notes</label><textarea name="notes"><?= app_h((string) ($editStudent['notes'] ?? '')) ?></textarea></div>
                    <div class="field"><label><?= $editStudent ? 'New password (optional)' : 'Password' ?></label><input type="password" name="password" <?= $editStudent ? '' : 'required' ?>></div>
                    <div class="actions">
                        <button type="submit"><?= $editStudent ? 'Update student' : 'Create student' ?></button>
                        <?php if ($editStudent): ?><a class="button secondary" href="<?= app_base_url('dashboard/students') ?>">Cancel</a><?php endif; ?>
                    </div>
                </form>
            </div>
            <div class="card">
                <h2>Student list</h2>
                <table>
                    <thead><tr><th>Name</th><th>Phone</th><th>Parent</th><th>QR</th><th>Actions</th></tr></thead>
                    <tbody>
                    <?php foreach ($students as $student): ?>
                        <tr>
                            <td><?= app_h($student['name']) ?></td>
                            <td><?= app_h($student['phone']) ?></td>
                            <td><?= app_h($student['parent_name']) ?></td>
                            <td><?= app_h($student['qr_code']) ?></td>
                            <td class="actions">
                                <a class="button secondary" href="<?= app_base_url('dashboard/students/' . urlencode((string) $student['id'])) ?>">View</a>
                                <a class="button secondary" href="<?= app_base_url('dashboard/students?edit=' . urlencode((string) $student['id'])) ?>">Edit</a>
                                <form method="post" action="<?= app_base_url('dashboard/students') ?>" onsubmit="return confirm('Delete this student?');">
                                    <?= \PhpLms\Core\Csrf::field() ?>
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="student_id" value="<?= app_h((string) $student['id']) ?>">
                                    <button type="submit">Delete</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <?php if (!empty($selectedStudent)): ?>
            <div class="two-col">
                <div class="card">
                    <p class="eyebrow">Student profile</p>
                    <h2><?= app_h((string) $selectedStudent['name']) ?></h2>
                    <div class="feature-grid cols-2">
                        <div class="feature-tile"><strong>Phone</strong><p><?= app_h((string) $selectedStudent['phone']) ?></p></div>
                        <div class="feature-tile"><strong>Email</strong><p><?= app_h((string) ($selectedStudent['email'] ?? '-')) ?></p></div>
                        <div class="feature-tile"><strong>Parent</strong><p><?= app_h((string) $selectedStudent['parent_name']) ?></p></div>
                        <div class="feature-tile"><strong>Parent contact</strong><p><?= app_h((string) ($selectedStudent['parent_contact'] ?? '-')) ?></p></div>
                        <div class="feature-tile"><strong>Grade</strong><p><?= app_h((string) ($selectedStudent['grade'] ?? '-')) ?></p></div>
                        <div class="feature-tile"><strong>School</strong><p><?= app_h((string) ($selectedStudent['school'] ?? '-')) ?></p></div>
                        <div class="feature-tile"><strong>Learning level</strong><p><?= app_h((string) ($selectedStudent['learning_level'] ?? '-')) ?></p></div>
                        <div class="feature-tile"><strong>QR code</strong><p><?= app_h((string) $selectedStudent['qr_code']) ?></p></div>
                    </div>
                </div>
                <div class="card">
                    <p class="eyebrow">Recent attendance</p>
                    <h2>Latest records</h2>
                    <div class="grid">
                        <?php if (empty($selectedStudent['attendance'])): ?>
                            <div class="empty">No attendance records yet.</div>
                        <?php endif; ?>
                        <?php foreach ($selectedStudent['attendance'] as $item): ?>
                            <div class="feature-tile">
                                <strong><?= app_date((string) $item['date']) ?></strong>
                                <p><?= app_status_badge((string) $item['status']) ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </section>
<?php else: ?>
    <section class="page-section stack">
        <div><p class="eyebrow">Student profile</p><h1><?= app_h((string) $student['name']) ?></h1></div>
        <div class="two-col">
            <div class="card">
                <h2>Profile</h2>
                <p>Phone: <?= app_h((string) $student['phone']) ?></p>
                <p>Parent: <?= app_h((string) $student['parent_name']) ?></p>
                <p>Parent contact: <?= app_h((string) ($student['parent_contact'] ?? '-')) ?></p>
                <p>Grade: <?= app_h((string) ($student['grade'] ?? '-')) ?></p>
                <p>School: <?= app_h((string) ($student['school'] ?? '-')) ?></p>
                <p>QR code: <?= app_h((string) $student['qr_code']) ?></p>
            </div>
            <div class="card">
                <h2>Recent attendance</h2>
                <?php foreach ($student['attendance'] as $item): ?>
                    <div class="card soft">
                        <strong><?= app_date((string) $item['date']) ?></strong>
                        <p><?= app_status_badge((string) $item['status']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
<?php endif; ?>
