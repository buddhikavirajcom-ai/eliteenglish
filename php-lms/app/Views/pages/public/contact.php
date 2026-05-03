<section class="page-section two-col">
    <div class="stack">
        <div class="card">
            <p class="eyebrow">Contact</p>
            <h1>Talk to the teacher before you enroll.</h1>
            <p>Families can ask about the right level, current openings, schedules, and fees before joining. The goal is to make enrollment feel easy and reassuring.</p>
        </div>

        <div class="grid">
            <div class="card">
                <p class="eyebrow">Phone</p>
                <h3><?= app_h($teacher['phone'] ?? 'Available after enrollment') ?></h3>
                <p>Best for quick schedule and class questions.</p>
            </div>
            <div class="card">
                <p class="eyebrow">Email</p>
                <h3><?= app_h($teacher['email'] ?? 'Portal login available after enrollment') ?></h3>
                <p>Best for detailed questions from parents.</p>
            </div>
        </div>
    </div>

    <div class="stack">
        <div class="card">
            <p class="eyebrow">What you can ask</p>
            <h2>Useful topics before joining</h2>
            <p>Families usually contact the teacher to check fit, schedule, availability, and the most suitable class type.</p>
            <div class="feature-grid cols-2">
                <div class="feature-tile"><strong>Level and fit</strong><p>Which class fits my child best?</p></div>
                <div class="feature-tile"><strong>Openings</strong><p>What time slots are currently open?</p></div>
                <div class="feature-tile"><strong>Fees</strong><p>How much is the monthly or class fee?</p></div>
                <div class="feature-tile"><strong>Progress</strong><p>How do updates work for parents?</p></div>
            </div>
        </div>

        <div class="card">
            <p class="eyebrow">Current class schedule</p>
            <h2>Helpful when asking about a specific opening</h2>
            <div class="grid">
                <?php if (!$classes): ?>
                    <div class="empty">No active classes are listed right now. Please contact the teacher for the next available opening.</div>
                <?php endif; ?>
                <?php foreach ($classes as $class): ?>
                    <div class="feature-tile">
                        <strong><?= app_h($class['title']) ?></strong>
                        <p><?= app_schedule_day_label((string) $class['schedule_day']) ?> | <?= app_time_range((string) $class['start_time'], (string) $class['end_time']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</section>
