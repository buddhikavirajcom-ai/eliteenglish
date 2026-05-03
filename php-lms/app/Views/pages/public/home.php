<section class="hero">
    <div class="hero-panel hero-gradient">
        <div class="hero-grid">
            <div class="stack">
                <span class="hero-chip">Premium online learning for ambitious students</span>
                <div class="stack" style="gap: 1rem;">
                    <p class="eyebrow">Personal English teacher for school learners</p>
                    <h1>Warm, structured English classes that help students grow with confidence.</h1>
                    <p>A premium but personal learning space for students who need clear explanations, steady practice, and parent-friendly communication.</p>
                </div>
                <div class="actions">
                    <a class="button button-pill button-light" href="<?= app_base_url('classes') ?>">Explore courses</a>
                    <a class="button button-pill" href="<?= app_base_url('contact') ?>">Book a consultation</a>
                </div>
                <div class="metric-grid">
                    <div class="metric-card">
                        <strong><?= (int) ($teacher['active_class_count'] ?? 0) ?></strong>
                        <span>Active classes</span>
                    </div>
                    <div class="metric-card">
                        <strong><?= (int) ($teacher['total_students'] ?? 0) ?></strong>
                        <span>Current learners</span>
                    </div>
                    <div class="metric-card">
                        <strong>Parent-first</strong>
                        <span>Calm communication and structure</span>
                    </div>
                </div>
            </div>

            <div class="stack">
                <div class="card">
                    <p class="eyebrow">Teacher profile</p>
                    <h2><?= app_h($teacher['name'] ?? 'Private English Teacher') ?></h2>
                    <p>Supporting school learners with structured lessons, readable feedback, and a teaching style that stays both professional and approachable.</p>
                    <div class="feature-grid cols-2">
                        <div class="feature-tile">
                            <strong>Email</strong>
                            <p><?= app_h($teacher['email'] ?? 'Available after enrollment') ?></p>
                        </div>
                        <div class="feature-tile">
                            <strong>Phone</strong>
                            <p><?= app_h($teacher['phone'] ?? 'Available after enrollment') ?></p>
                        </div>
                        <div class="feature-tile">
                            <strong>Portal</strong>
                            <p>Admin and student workflows in one place</p>
                        </div>
                        <div class="feature-tile">
                            <strong>Experience</strong>
                            <p>Warm, structured, and parent-friendly</p>
                        </div>
                    </div>
                </div>
                <div class="feature-grid cols-3">
                    <div class="feature-tile">
                        <strong>Clear weekly structure</strong>
                        <p>Students always know what to focus on next.</p>
                    </div>
                    <div class="feature-tile">
                        <strong>Confident communication</strong>
                        <p>Speaking, writing, reading, and listening stay balanced.</p>
                    </div>
                    <div class="feature-tile">
                        <strong>Parent-friendly updates</strong>
                        <p>Homework, progress, and payments stay easy to follow.</p>
                    </div>
                </div>
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
        <a class="button button-light button-pill" href="<?= app_base_url('classes') ?>">View all courses</a>
    </div>

    <div class="grid">
        <?php if (!$classes): ?>
            <div class="empty">No active classes are listed right now.</div>
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

<section class="page-section two-col">
    <div class="card">
        <p class="eyebrow">Testimonials</p>
        <h2>Warm words from students and parents</h2>
        <div class="grid">
            <?php foreach ($testimonials as $item): ?>
                <div class="card soft">
                    <strong><?= app_h($item['name']) ?></strong>
                    <p><?= app_h($item['role']) ?></p>
                    <p><?= app_h($item['quote']) ?></p>
                    <?php if (!empty($item['result'])): ?>
                        <div class="result-pill"><strong>Result:</strong> <?= app_h((string) $item['result']) ?></div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="card">
        <p class="eyebrow">Latest messages</p>
        <h2>Recent parent-facing updates</h2>
        <div class="grid">
            <?php if (!$announcements): ?>
                <div class="empty">No public-facing messages yet.</div>
            <?php endif; ?>
            <?php foreach ($announcements as $message): ?>
                <div class="card soft">
                    <strong><?= app_h($message['title']) ?></strong>
                    <p><?= app_h($message['message']) ?></p>
                    <p><?= app_h($message['author_name']) ?> | <?= app_date((string) $message['created_at'], 'd M Y, h:i A') ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
