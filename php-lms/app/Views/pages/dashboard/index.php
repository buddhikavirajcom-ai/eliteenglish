<?php if ($mode === 'admin'): ?>
    <section class="page-section stack">
        <div class="stack" style="gap: 0.65rem;">
            <p class="eyebrow">Admin overview</p>
            <h1>Operations Dashboard</h1>
            <p>Track learner activity, payment progress, class scheduling, and recent academic movement from a single premium dashboard.</p>
        </div>

        <div class="stats">
            <div class="stat"><span class="muted">Total Students</span><strong><?= (int) $stats['students'] ?></strong></div>
            <div class="stat"><span class="muted">Paid Revenue</span><strong><?= app_currency($stats['paid_total']) ?></strong></div>
            <div class="stat"><span class="muted">Attendance Rate</span><strong><?= app_percent($stats['attendance_rate']) ?></strong></div>
            <div class="stat"><span class="muted">Upcoming Classes</span><strong><?= (int) $stats['upcoming_classes'] ?></strong></div>
        </div>

        <div class="section-grid">
            <div class="card">
                <p class="eyebrow">Recent activity</p>
                <h2>Latest operational changes</h2>
                <div class="grid">
                    <?php if (!$activities): ?>
                        <div class="empty">Once you start using the system, activity will appear here.</div>
                    <?php endif; ?>
                    <?php foreach ($activities as $activity): ?>
                        <div class="feature-tile">
                            <strong><?= app_h($activity['title']) ?></strong>
                            <p><?= app_h($activity['description']) ?></p>
                            <p class="muted"><?= app_date((string) $activity['activity_at'], 'd M Y, h:i A') ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="card">
                <p class="eyebrow">Upcoming class schedule</p>
                <h2>Quick visibility into upcoming sessions</h2>
                <div class="grid">
                    <?php if (!$classes): ?>
                        <div class="empty">Create a class to populate the upcoming schedule panel.</div>
                    <?php endif; ?>
                    <?php foreach ($classes as $class): ?>
                        <div class="feature-tile">
                            <strong><?= app_h($class['title']) ?></strong>
                            <p><?= app_h($class['subject']) ?> - <?= app_h($class['level']) ?></p>
                            <p><?= app_date((string) $class['date']) ?> | <?= app_schedule_day_label((string) $class['schedule_day']) ?> | <?= app_time_range((string) $class['start_time'], (string) $class['end_time']) ?></p>
                            <p><?= app_h((string) $class['teacher_name']) ?> | <?= (int) $class['enrolled_count'] ?>/<?= (int) $class['capacity'] ?> students assigned</p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>
<?php else: ?>
    <section class="page-section stack">
        <div class="stack" style="gap: 0.65rem;">
            <p class="eyebrow">Student overview</p>
            <h1>Welcome back, <?= app_h((string) $student['name']) ?></h1>
            <p>Keep your classes, attendance, payments, and latest quiz outcomes visible from one clean student dashboard.</p>
        </div>

        <div class="stats">
            <div class="stat"><span class="muted">QR Code</span><strong><?= app_h((string) $student['qr_code']) ?></strong></div>
            <div class="stat"><span class="muted">Classes</span><strong><?= count($student['classes']) ?></strong></div>
            <div class="stat"><span class="muted">Payments</span><strong><?= count($student['payments']) ?></strong></div>
            <div class="stat"><span class="muted">Quiz Results</span><strong><?= count($student['results']) ?></strong></div>
        </div>

        <div class="section-grid">
            <div class="card">
                <p class="eyebrow">Next classes</p>
                <h2>Your upcoming lessons</h2>
                <div class="grid">
                    <?php if (!$student['classes']): ?>
                        <div class="empty">Your teacher will add classes here once you are enrolled.</div>
                    <?php endif; ?>
                    <?php foreach ($student['classes'] as $class): ?>
                        <div class="feature-tile">
                            <strong><?= app_h($class['title']) ?></strong>
                            <p><?= app_h($class['subject']) ?> - <?= app_h($class['level']) ?></p>
                            <p><?= app_date((string) $class['date']) ?> | <?= app_schedule_day_label((string) $class['schedule_day']) ?> | <?= app_time_range((string) $class['start_time'], (string) $class['end_time']) ?></p>
                            <p><?= app_h((string) $class['teacher_name']) ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="card">
                <p class="eyebrow">Latest quiz results</p>
                <h2>Your most recent submissions</h2>
                <div class="grid">
                    <?php if (!$student['results']): ?>
                        <div class="empty">Quizzes assigned by your teacher will appear under the quizzes tab.</div>
                    <?php endif; ?>
                    <?php foreach ($student['results'] as $result): ?>
                        <div class="feature-tile">
                            <strong><?= app_h($result['quiz_title']) ?></strong>
                            <p>Score: <?= (int) $result['score'] ?>/<?= (int) $result['total_questions'] ?></p>
                            <p><?= app_date((string) $result['submitted_at'], 'd M Y, h:i A') ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>
<?php endif; ?>
