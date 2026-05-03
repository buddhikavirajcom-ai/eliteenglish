<section class="page-section">
    <div class="split-hero">
        <div class="hero-panel" style="background: radial-gradient(circle at top left, rgba(95, 144, 243, 0.28), transparent 32%), radial-gradient(circle at bottom right, rgba(222, 134, 21, 0.16), transparent 28%), linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.72));">
            <span class="hero-chip light">Premium academic operations for modern learning centers</span>
            <div class="stack" style="margin-top: 1.4rem;">
                <h1>A polished LMS for classes, payments, attendance, and progress management.</h1>
                <p>Apoorwa LMS is designed for day-to-day academic operations, giving admins and students a clearer dashboard, stronger data flow, and a calmer experience across every core workflow.</p>
            </div>

            <div class="feature-grid cols-2" style="margin-top: 1.6rem;">
                <div class="card">
                    <strong>Academic operations</strong>
                    <p>Manage classes, students, and teaching schedules from one calm workspace.</p>
                </div>
                <div class="card">
                    <strong>Attendance and billing</strong>
                    <p>Keep QR attendance, payment tracking, and reminders visible and consistent.</p>
                </div>
                <div class="card">
                    <strong>Learning progress</strong>
                    <p>Run quizzes, review outcomes, and surface the right details for students quickly.</p>
                </div>
                <div class="card">
                    <strong>Flexible sign-in</strong>
                    <p>Continue with your existing teacher and student credentials for the PHP portal.</p>
                </div>
            </div>
        </div>

        <div class="card login-card">
            <p class="eyebrow">Portal login</p>
            <h2>Sign in to <?= app_h((string) app_config('app.name')) ?></h2>
            <p>Use your email or phone number along with your password to access the latest dashboard and management tools.</p>
            <form method="post" action="<?= app_base_url('login') ?>">
                <?= \PhpLms\Core\Csrf::field() ?>
                <div class="field">
                    <label>Email or phone</label>
                    <input name="identifier" required>
                </div>
                <div class="field">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit">Sign in</button>
            </form>
            <div class="feature-grid" style="margin-top: 1rem;">
                <div class="feature-tile">
                    <strong>Demo teacher</strong>
                    <p>admin@lms.local / admin123</p>
                </div>
                <div class="feature-tile">
                    <strong>Demo student</strong>
                    <p>0771234567 / student123</p>
                </div>
            </div>
        </div>
    </div>
</section>
