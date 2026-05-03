<section class="page-section stack">
    <div><p class="eyebrow">Messages</p><h1><?= $mode === 'admin' ? 'Announcement board' : 'Announcements' ?></h1></div>
    <?php if ($mode === 'admin'): ?>
        <div class="card">
            <h2>Post announcement</h2>
            <form method="post" action="<?= app_base_url('dashboard/messages') ?>">
                <?= \PhpLms\Core\Csrf::field() ?>
                <div class="field"><label>Title</label><input name="title" required></div>
                <div class="field"><label>Message</label><textarea name="message" required></textarea></div>
                <button type="submit">Post message</button>
            </form>
        </div>
    <?php endif; ?>
    <div class="grid">
        <?php foreach ($messages as $message): ?>
            <div class="card">
                <strong><?= app_h($message['title']) ?></strong>
                <p><?= app_h($message['message']) ?></p>
                <p><?= app_h((string) $message['author_name']) ?> | <?= app_date((string) $message['created_at'], 'd M Y, h:i A') ?></p>
            </div>
        <?php endforeach; ?>
    </div>
</section>

