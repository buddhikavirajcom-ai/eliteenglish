<?php if ($mode === 'admin'): ?>
    <section class="page-section stack">
        <div><p class="eyebrow">Quizzes</p><h1>Quiz creation and results</h1></div>
        <div class="two-col">
            <div class="card">
                <h2>Create quiz</h2>
                <form method="post" action="<?= app_base_url('dashboard/quizzes') ?>">
                    <?= \PhpLms\Core\Csrf::field() ?>
                    <div class="field"><label>Title</label><input name="title" required></div>
                    <div class="field"><label>Description</label><textarea name="description"></textarea></div>
                    <div class="field">
                        <label>Questions JSON</label>
                        <textarea name="questions_json" placeholder='[{"prompt":"What is 1+1?","options":["1","2","3"],"correctAnswer":1}]' required></textarea>
                    </div>
                    <button type="submit">Create quiz</button>
                </form>
            </div>
            <div class="card">
                <h2>Quiz list</h2>
                <?php foreach ($quizzes as $quiz): ?>
                    <div class="card soft">
                        <strong><?= app_h($quiz['title']) ?></strong>
                        <p><?= app_h((string) ($quiz['description'] ?? '')) ?></p>
                        <p><?= (int) $quiz['question_count'] ?> questions | <?= app_h((string) $quiz['teacher_name']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="card">
            <h2>Student results</h2>
            <table>
                <thead><tr><th>Student</th><th>Quiz</th><th>Score</th><th>Submitted</th></tr></thead>
                <tbody>
                <?php foreach ($results as $result): ?>
                    <tr>
                        <td><?= app_h((string) $result['student_name']) ?></td>
                        <td><?= app_h((string) $result['quiz_title']) ?></td>
                        <td><?= (int) $result['score'] ?>/<?= (int) $result['total_questions'] ?></td>
                        <td><?= app_date((string) $result['submitted_at'], 'd M Y, h:i A') ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>
<?php else: ?>
    <section class="page-section stack">
        <div><p class="eyebrow">Quizzes</p><h1>Your quizzes</h1></div>
        <div class="grid">
            <?php foreach ($quizzes as $quiz): ?>
                <div class="card">
                    <strong><?= app_h($quiz['title']) ?></strong>
                    <p><?= app_h((string) ($quiz['description'] ?? '')) ?></p>
                    <?php if (!empty($quiz['result_id'])): ?>
                        <p>Submitted score: <?= (int) $quiz['score'] ?>/<?= (int) $quiz['total_questions'] ?></p>
                        <a class="button secondary" href="<?= app_base_url('dashboard/quizzes/attempt/' . urlencode((string) $quiz['id'])) ?>">Review result</a>
                    <?php else: ?>
                        <a class="button" href="<?= app_base_url('dashboard/quizzes/attempt/' . urlencode((string) $quiz['id'])) ?>">Attempt quiz</a>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        <?php if ($selectedQuiz): ?>
            <div class="card">
                <h2><?= app_h($selectedQuiz['title']) ?></h2>
                <?php if (!empty($selectedQuizResult)): ?>
                    <p>Score: <?= (int) $selectedQuizResult['score'] ?>/<?= (int) $selectedQuizResult['total_questions'] ?></p>
                    <div class="grid">
                        <?php foreach ($selectedQuiz['questions'] as $index => $question): ?>
                            <?php
                                $selectedAnswer = $selectedQuizResult['answers'][$index] ?? null;
                                $correctAnswer = (int) $question['correct_answer'];
                                $options = $question['options'];
                            ?>
                            <div class="card soft">
                                <strong><?= ($index + 1) ?>. <?= app_h((string) $question['prompt']) ?></strong>
                                <p>Your answer: <?= $selectedAnswer !== null && isset($options[$selectedAnswer]) ? app_h((string) $options[$selectedAnswer]) : 'No answer selected' ?></p>
                                <p>Correct answer: <?= isset($options[$correctAnswer]) ? app_h((string) $options[$correctAnswer]) : '-' ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <form method="post" action="<?= app_base_url('dashboard/quizzes') ?>">
                        <?= \PhpLms\Core\Csrf::field() ?>
                        <input type="hidden" name="quiz_id" value="<?= app_h((string) $selectedQuiz['id']) ?>">
                        <?php foreach ($selectedQuiz['questions'] as $index => $question): ?>
                            <div class="card soft">
                                <strong><?= ($index + 1) ?>. <?= app_h((string) $question['prompt']) ?></strong>
                                <?php foreach ($question['options'] as $optionIndex => $option): ?>
                                    <div class="field">
                                        <label><input type="radio" name="answers[<?= $index ?>]" value="<?= $optionIndex ?>" required> <?= app_h((string) $option) ?></label>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endforeach; ?>
                        <button type="submit">Submit quiz</button>
                    </form>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </section>
<?php endif; ?>
