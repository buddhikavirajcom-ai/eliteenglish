<section class="page-section stack">
    <div class="stack">
        <p class="eyebrow">Online enrollment</p>
        <h1>Request a seat in <?= app_h($class['title'] ?? 'this class') ?></h1>
        <p>Send the class request first, then upload the payment slip so the teacher can review and approve the enrollment.</p>
    </div>

    <div class="two-col">
        <div class="stack">
            <div class="card">
                <p class="eyebrow">Class summary</p>
                <?php if ($class): ?>
                    <h2><?= app_h($class['title']) ?></h2>
                    <p><?= app_h((string) $class['subject']) ?> for <?= app_h((string) $class['level']) ?> learners.</p>
                    <div class="feature-grid cols-2">
                        <div class="feature-tile">
                            <strong>Next session</strong>
                            <p><?= app_date((string) $class['date']) ?></p>
                            <p><?= app_schedule_day_label((string) $class['schedule_day']) ?></p>
                        </div>
                        <div class="feature-tile">
                            <strong>Time</strong>
                            <p><?= app_time_range((string) $class['start_time'], (string) $class['end_time']) ?></p>
                            <p>Teacher: <?= app_h((string) ($class['teacher_name'] ?? 'Private English Teacher')) ?></p>
                        </div>
                        <div class="feature-tile">
                            <strong>Class fee</strong>
                            <p><?= app_currency($class['fee']) ?></p>
                        </div>
                        <div class="feature-tile">
                            <strong>Seats</strong>
                            <p><?= (int) ($class['seats_taken'] ?? 0) ?> enrolled of <?= (int) $class['capacity'] ?></p>
                        </div>
                    </div>
                    <?php if (!empty($class['notes'])): ?>
                        <div class="result-pill"><?= app_h((string) $class['notes']) ?></div>
                    <?php endif; ?>
                <?php else: ?>
                    <div class="empty">Select a valid class from the public class list first.</div>
                <?php endif; ?>
            </div>

            <div class="card">
                <p class="eyebrow">Need help before you pay?</p>
                <h2>Use the contact page if you need help choosing the class.</h2>
                <p>Families can confirm schedule, suitability, and availability before sending the payment slip.</p>
                <a class="public-text-link" href="<?= app_base_url('contact') ?>">Contact teacher</a>
            </div>
        </div>

        <div class="stack">
            <?php if ($class && !$request): ?>
                <div class="card">
                    <h2>Enrollment request</h2>
                    <p>This keeps the process simple: send the request, upload the slip, and wait for teacher approval.</p>
                    <form method="post" action="<?= app_base_url('classes/' . urlencode((string) $class['id']) . '/enroll') ?>">
                        <?= \PhpLms\Core\Csrf::field() ?>
                        <input type="hidden" name="action" value="create_request">
                        <input type="hidden" name="class_id" value="<?= app_h((string) $class['id']) ?>">
                        <div class="field-grid">
                            <div class="field"><label>Student name</label><input name="student_name" required></div>
                            <div class="field"><label>Student phone</label><input name="student_phone" required></div>
                            <div class="field"><label>Student email</label><input type="email" name="student_email"></div>
                            <div class="field"><label>Parent name</label><input name="parent_name" required></div>
                            <div class="field"><label>Parent contact</label><input name="parent_contact"></div>
                            <div class="field"><label>Grade</label><input name="grade"></div>
                            <div class="field"><label>School</label><input name="school"></div>
                            <div class="field"><label>Learning level</label><input name="learning_level"></div>
                            <div class="field"><label>Notes</label><textarea name="notes"></textarea></div>
                        </div>
                        <button type="submit">Create request</button>
                    </form>
                </div>
            <?php endif; ?>

            <?php if ($request): ?>
                <div class="card">
                    <p class="eyebrow">Enrollment request status</p>
                    <h2><?= app_h((string) $request['class_title']) ?></h2>
                    <p>Request ID: <?= app_h((string) $request['id']) ?></p>
                    <p>Status: <?= app_status_badge((string) $request['status']) ?></p>
                    <?php if (!empty($request['payment_slip_name'])): ?>
                        <p>Uploaded slip: <?= app_h((string) $request['payment_slip_name']) ?></p>
                    <?php endif; ?>
                    <?php if (!empty($request['review_note'])): ?>
                        <div class="result-pill"><strong>Teacher note:</strong> <?= app_h((string) $request['review_note']) ?></div>
                    <?php endif; ?>
                </div>

                <?php if (in_array($request['status'], ['REQUESTED', 'PAYMENT_SUBMITTED'], true)): ?>
                    <div class="card">
                        <h2>Upload payment slip</h2>
                        <p>Once the payment slip is uploaded, the teacher can review the enrollment request.</p>
                        <form method="post" enctype="multipart/form-data" action="<?= app_base_url('classes/' . urlencode((string) $request['class_id']) . '/enroll?request=' . urlencode((string) $request['id'])) ?>">
                            <?= \PhpLms\Core\Csrf::field() ?>
                            <input type="hidden" name="action" value="upload_payment">
                            <input type="hidden" name="request_id" value="<?= app_h((string) $request['id']) ?>">
                            <div class="field"><label>Payment slip</label><input type="file" name="payment_slip" required></div>
                            <button type="submit">Upload slip</button>
                        </form>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</section>
