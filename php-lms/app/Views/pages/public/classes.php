<section class="page-section stack">
    <div class="two-col">
        <div class="stack">
            <div class="card">
                <p class="eyebrow">Classes</p>
                <h1>Clean, premium English classes for focused learners.</h1>
                <p>Each class is designed to stay focused, easy to follow, and useful for real school progress without overwhelming students.</p>
            </div>
        </div>

        <div class="feature-grid cols-3">
            <div class="card">
                <p class="eyebrow">Teacher</p>
                <h3><?= app_h($teacher['name'] ?? 'Private English Teacher') ?></h3>
                <p>Warm, structured, and parent-friendly</p>
            </div>
            <div class="card">
                <p class="eyebrow">Published</p>
                <h3><?= count($classes) ?> active classes</h3>
                <p>Ready for families to review online</p>
            </div>
            <div class="card">
                <p class="eyebrow">Experience</p>
                <h3>Premium and calm</h3>
                <p>Readable schedules, clear fees, and guided enrollment</p>
            </div>
        </div>
    </div>
</section>

<section class="page-section stack">
    <div class="toolbar">
        <div>
            <p class="eyebrow">Open classes</p>
            <h2>Choose the class style that fits your child best</h2>
            <p>Each course card keeps the details easy to scan: level, time, format, fee, and teacher.</p>
        </div>
        <a class="public-text-link" href="<?= app_base_url('contact') ?>">Ask about enrollment</a>
    </div>

    <div class="grid">
        <?php if (!$classes): ?>
            <div class="empty">No classes are published right now. Please use the contact page to ask about the next available intake.</div>
        <?php endif; ?>

        <?php foreach ($classes as $class): ?>
            <div class="card">
                <div class="toolbar">
                    <div>
                        <p class="eyebrow"><?= app_h((string) $class['subject']) ?></p>
                        <h3><?= app_h($class['title']) ?></h3>
                        <p><?= app_h((string) $class['level']) ?> learners with personal guidance and clear weekly practice.</p>
                    </div>
                    <?= app_status_badge((string) $class['type']) ?>
                </div>

                <div class="feature-grid cols-2">
                    <div class="feature-tile">
                        <strong>Schedule</strong>
                        <p><?= app_schedule_day_label((string) $class['schedule_day']) ?></p>
                        <p><?= app_date((string) $class['date']) ?></p>
                    </div>
                    <div class="feature-tile">
                        <strong>Time</strong>
                        <p><?= app_time_range((string) $class['start_time'], (string) $class['end_time']) ?></p>
                        <p>Teacher: <?= app_h((string) $class['teacher_name']) ?></p>
                    </div>
                    <div class="feature-tile">
                        <strong>Fee</strong>
                        <p><?= app_currency($class['fee']) ?></p>
                        <p>Premium, focused class experience</p>
                    </div>
                    <div class="feature-tile">
                        <strong>Format</strong>
                        <p><?= (string) $class['type'] === 'ONLINE' ? 'Live online session' : app_h((string) ($class['location'] ?: 'In-person class')) ?></p>
                        <p><?= max((int) $class['capacity'] - (int) $class['seats_taken'], 0) ?> seats available</p>
                    </div>
                </div>

                <?php if (!empty($class['notes'])): ?>
                    <div class="result-pill"><?= app_h((string) $class['notes']) ?></div>
                <?php endif; ?>

                <div class="toolbar">
                    <p><strong><?= (int) $class['seats_taken'] ?></strong> enrolled of <?= (int) $class['capacity'] ?></p>
                    <div class="actions">
                        <a class="button button-pill" href="<?= app_base_url('classes/' . urlencode((string) $class['id']) . '/enroll') ?>">Enroll online</a>
                        <a class="button button-light button-pill" href="<?= app_base_url('contact') ?>">Ask a question</a>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</section>
