<?php declare(strict_types=1);

$currentPath = app_path();
$isDashboard = str_starts_with($currentPath, '/dashboard');
$isPublicClasses = $currentPath === '/classes' || str_starts_with($currentPath, '/classes/');
$publicNav = [
    ['href' => '', 'label' => 'Home', 'active' => $currentPath === '/'],
    ['href' => 'about', 'label' => 'About', 'active' => $currentPath === '/about' || $currentPath === '/about-teacher'],
    ['href' => 'classes', 'label' => 'Courses', 'active' => $isPublicClasses],
    ['href' => 'testimonials', 'label' => 'Reviews', 'active' => $currentPath === '/testimonials'],
    ['href' => 'faq', 'label' => 'FAQ', 'active' => $currentPath === '/faq'],
    ['href' => 'contact', 'label' => 'Contact', 'active' => $currentPath === '/contact' || $currentPath === '/contact-teacher'],
];

$dashboardNav = [];
if ($user) {
    $dashboardNav = ($user['role'] ?? '') === 'ADMIN'
        ? [
            ['href' => 'dashboard', 'label' => 'Dashboard'],
            ['href' => 'dashboard/students', 'label' => 'Students'],
            ['href' => 'dashboard/classes', 'label' => 'Classes'],
            ['href' => 'dashboard/attendance', 'label' => 'Attendance'],
            ['href' => 'dashboard/homework', 'label' => 'Homework'],
            ['href' => 'dashboard/quizzes', 'label' => 'Quizzes'],
            ['href' => 'dashboard/progress', 'label' => 'Progress'],
            ['href' => 'dashboard/payments', 'label' => 'Payments'],
            ['href' => 'dashboard/materials', 'label' => 'Materials'],
            ['href' => 'dashboard/messages', 'label' => 'Messages'],
        ]
        : [
            ['href' => 'dashboard', 'label' => 'Dashboard'],
            ['href' => 'dashboard/classes', 'label' => 'Classes'],
            ['href' => 'dashboard/homework', 'label' => 'Homework'],
            ['href' => 'dashboard/quizzes', 'label' => 'Quizzes'],
            ['href' => 'dashboard/progress', 'label' => 'Progress'],
            ['href' => 'dashboard/attendance', 'label' => 'Attendance'],
            ['href' => 'dashboard/payments', 'label' => 'Payments'],
            ['href' => 'dashboard/materials', 'label' => 'Materials'],
            ['href' => 'dashboard/messages', 'label' => 'Messages'],
        ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= app_h($title) ?> | <?= app_h((string) app_config('app.name')) ?></title>
    <link rel="stylesheet" href="<?= app_base_url('assets/styles.css') ?>">
</head>
<body class="<?= $isDashboard ? 'dashboard-body' : 'public-body' ?>">
    <?php if ($isDashboard): ?>
        <div class="dashboard-shell">
            <aside class="dashboard-sidebar">
                <div class="dashboard-brand-card">
                    <div class="dashboard-brand-mark">EA</div>
                    <div>
                        <p class="dashboard-brand-title"><?= app_h((string) app_config('app.name')) ?></p>
                        <p class="dashboard-brand-subtitle"><?= ($user['role'] ?? '') === 'ADMIN' ? 'Teacher Workspace' : 'Parent Portal' ?></p>
                    </div>
                </div>

                <div class="dashboard-signed-in">
                    <p class="dashboard-meta-label">Signed In</p>
                    <p class="dashboard-user-name"><?= app_h((string) ($user['name'] ?? 'User')) ?></p>
                </div>

                <nav class="dashboard-nav">
                    <?php foreach ($dashboardNav as $item): ?>
                        <?php $active = $currentPath === '/' . trim($item['href'], '/') || str_starts_with($currentPath, '/' . trim($item['href'], '/') . '/'); ?>
                        <a class="dashboard-nav-link <?= $active ? 'active' : '' ?>" href="<?= app_base_url($item['href']) ?>">
                            <span class="dashboard-nav-dot"></span>
                            <?= app_h($item['label']) ?>
                        </a>
                    <?php endforeach; ?>
                </nav>

                <form method="post" action="<?= app_base_url('logout') ?>" class="dashboard-logout-form">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <button type="submit" class="button button-light button-block">Sign out</button>
                </form>
            </aside>

            <main class="dashboard-main">
                <?php foreach ($flashMessages as $flash): ?>
                    <div class="flash <?= app_h((string) $flash['type']) ?>"><?= app_h((string) $flash['message']) ?></div>
                <?php endforeach; ?>

                <?php require $viewFile; ?>
            </main>
        </div>
    <?php else: ?>
        <header class="public-header">
            <div class="public-nav-shell">
                <a class="public-brand" href="<?= app_base_url('') ?>">
                    <span class="public-brand-mark">EA</span>
                    <span>
                        <span class="public-brand-title"><?= app_h((string) app_config('app.name')) ?></span>
                        <span class="public-brand-subtitle">Premium online coaching</span>
                    </span>
                </a>

                <nav class="public-nav">
                    <?php foreach ($publicNav as $item): ?>
                        <a class="public-nav-link <?= $item['active'] ? 'active' : '' ?>" href="<?= app_base_url($item['href']) ?>"><?= app_h($item['label']) ?></a>
                    <?php endforeach; ?>
                </nav>

                <div class="public-actions">
                    <?php if ($user): ?>
                        <a class="public-text-link" href="<?= app_base_url('dashboard') ?>">Dashboard</a>
                        <form method="post" action="<?= app_base_url('logout') ?>" class="inline-form">
                            <?= \PhpLms\Core\Csrf::field() ?>
                            <button type="submit" class="button button-dark button-pill">Logout</button>
                        </form>
                    <?php else: ?>
                        <a class="public-text-link" href="<?= app_base_url('login') ?>">Login</a>
                        <a class="button button-dark button-pill" href="<?= app_base_url('classes') ?>">Sign Up</a>
                    <?php endif; ?>
                </div>
            </div>
        </header>

        <main class="public-main">
            <?php foreach ($flashMessages as $flash): ?>
                <div class="page-shell">
                    <div class="flash <?= app_h((string) $flash['type']) ?>"><?= app_h((string) $flash['message']) ?></div>
                </div>
            <?php endforeach; ?>

            <?php require $viewFile; ?>
        </main>

        <footer class="public-footer">
            <div class="public-footer-shell">
                <div class="public-footer-brand">
                    <div class="public-brand-mark footer-mark">EA</div>
                    <div>
                        <p class="public-brand-title"><?= app_h((string) app_config('app.name')) ?></p>
                        <p class="public-brand-subtitle">Warm, modern English coaching for school learners.</p>
                    </div>
                </div>
                <div>
                    <p class="footer-heading">Pages</p>
                    <div class="footer-links">
                        <?php foreach ($publicNav as $item): ?>
                            <a href="<?= app_base_url($item['href']) ?>"><?= app_h($item['label']) ?></a>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div>
                    <p class="footer-heading">Quick Help</p>
                    <div class="footer-copy">
                        <p>Use the public pages to review classes, teacher details, and the enrollment flow before logging in.</p>
                        <p>Parents and students can access the portal after enrollment approval.</p>
                    </div>
                </div>
            </div>
        </footer>
    <?php endif; ?>
</body>
</html>
