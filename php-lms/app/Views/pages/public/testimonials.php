<section class="page-section stack">
    <div class="card">
        <p class="eyebrow">Testimonials</p>
        <h1>Warm words from students and parents</h1>
        <p>A personal teacher website should feel trustworthy. These testimonials reinforce the calm, professional experience the site is designed to communicate.</p>
    </div>

    <div class="feature-grid cols-3">
        <?php foreach ($items as $item): ?>
            <div class="card">
                <strong><?= app_h($item['name']) ?></strong>
                <p class="eyebrow" style="margin-top: 0.35rem; margin-bottom: 0.5rem; color: var(--muted-soft);"><?= app_h($item['role']) ?></p>
                <p><?= app_h($item['quote']) ?></p>
                <?php if (!empty($item['result'])): ?>
                    <div class="result-pill"><strong>Result:</strong> <?= app_h((string) $item['result']) ?></div>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="card">
        <h2>Ready to find the right class?</h2>
        <p>Families can browse the class list first and then reach out with questions about level, schedule, and fit.</p>
        <div class="actions">
            <a class="button button-pill" href="<?= app_base_url('classes') ?>">View classes</a>
            <a class="button button-light button-pill" href="<?= app_base_url('contact') ?>">Contact teacher</a>
        </div>
    </div>
</section>
