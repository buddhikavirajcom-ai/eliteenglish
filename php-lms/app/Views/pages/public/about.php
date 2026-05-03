<section class="page-section two-col">
    <div class="stack">
        <div class="card">
            <p class="eyebrow">About</p>
            <h1>Personal English teaching with clarity, calm, and care.</h1>
            <p>This is a personal teaching practice built around clarity, routine, and kind support. Lessons stay organized, expectations stay simple, and families always know what comes next.</p>
        </div>
        <div class="card dark">
            <p class="eyebrow">Teacher profile</p>
            <h2><?= app_h($teacher['name'] ?? 'Private English Teacher') ?></h2>
            <p>Supporting school learners with structured lessons, readable feedback, and a teaching style that stays both professional and approachable.</p>
        </div>
    </div>

    <div class="feature-grid cols-2">
        <div class="card">
            <p class="eyebrow">Teaching style</p>
            <h3>Clear weekly structure</h3>
            <p>Students know what they are learning, what to practice, and how to improve from one week to the next.</p>
        </div>
        <div class="card">
            <p class="eyebrow">Communication</p>
            <h3>Confident communication</h3>
            <p>Speaking, writing, reading, and listening are strengthened in a balanced way so students feel confident using English.</p>
        </div>
        <div class="card">
            <p class="eyebrow">Support</p>
            <h3>Parent-friendly updates</h3>
            <p>Homework, attendance, and progress stay simple to follow so parents can support learning without extra stress.</p>
        </div>
        <div class="card">
            <p class="eyebrow">Trust</p>
            <h3>A learning experience built for families</h3>
            <p>Families should feel that learning is organized, manageable, and worth their time from the first visit to the student portal.</p>
        </div>
    </div>
</section>

<section class="page-section">
    <div class="feature-grid cols-3">
        <div class="card">
            <p class="eyebrow">Active classes</p>
            <h2><?= (int) ($teacher['active_class_count'] ?? 0) ?></h2>
            <p>Focused class options currently open for families to review.</p>
        </div>
        <div class="card">
            <p class="eyebrow">Current learners</p>
            <h2><?= (int) ($teacher['total_students'] ?? 0) ?></h2>
            <p>Students receiving simple, steady support across active sessions.</p>
        </div>
        <div class="card">
            <p class="eyebrow">Next step</p>
            <h2>Simple and reassuring</h2>
            <p>Browse the courses first, then contact the teacher if you want help choosing the right class.</p>
        </div>
    </div>
</section>
