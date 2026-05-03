<section class="page-section stack">
    <div><p class="eyebrow">Materials</p><h1><?= $mode === 'admin' ? 'Learning materials' : 'Study materials' ?></h1></div>
    <?php if ($mode === 'admin'): ?>
        <div class="card">
            <h2>Upload material</h2>
            <form method="post" enctype="multipart/form-data" action="<?= app_base_url('dashboard/materials') ?>">
                <?= \PhpLms\Core\Csrf::field() ?>
                <div class="field"><label>Title</label><input name="title" required></div>
                <div class="field"><label>Category</label><select name="category"><option value="WORKSHEET">Worksheet</option><option value="STORY">Story</option><option value="VIDEO">Video</option></select></div>
                <div class="field"><label>Description</label><textarea name="description"></textarea></div>
                <div class="field"><label>File</label><input type="file" name="material_file" required></div>
                <button type="submit">Upload material</button>
            </form>
        </div>
    <?php endif; ?>
    <div class="grid">
        <?php foreach ($materials as $material): ?>
            <div class="card">
                <strong><?= app_h($material['title']) ?></strong>
                <p><?= app_h($material['category']) ?> | Uploaded by <?= app_h((string) $material['teacher_name']) ?></p>
                <p><?= app_h((string) ($material['description'] ?? '')) ?></p>
                <a class="button secondary" href="<?= app_public_upload_url((string) $material['file_path']) ?>">Download <?= app_h((string) $material['file_name']) ?></a>
            </div>
        <?php endforeach; ?>
    </div>
</section>

