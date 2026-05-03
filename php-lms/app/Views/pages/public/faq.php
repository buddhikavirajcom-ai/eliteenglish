<section class="page-section stack">
    <div class="card" style="text-align: center;">
        <p class="eyebrow">FAQ</p>
        <h1>Simple answers for students and parents</h1>
        <p>The public site keeps this information easy to find so families can make a confident decision without hunting through unnecessary pages.</p>
    </div>

    <div class="faq-list">
        <?php foreach ($faqs as $item): ?>
            <details class="faq-item">
                <summary><?= app_h($item['question']) ?></summary>
                <p><?= app_h($item['answer']) ?></p>
            </details>
        <?php endforeach; ?>
    </div>

    <div class="card" style="text-align: center;">
        <h2>Still have a question?</h2>
        <p>The contact page is open to everyone, so you can reach out before creating any portal account.</p>
        <div class="actions" style="justify-content: center;">
            <a class="button button-pill" href="<?= app_base_url('contact') ?>">Contact teacher</a>
            <a class="button button-light button-pill" href="<?= app_base_url('classes') ?>">View classes</a>
        </div>
    </div>
</section>
