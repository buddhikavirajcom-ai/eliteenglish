<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use PhpLms\Core\SecureMySQL;

/** @var SecureMySQL $db */
global $db;

$db->transaction(function (SecureMySQL $database): void {
    $tables = [
        'results',
        'questions',
        'quizzes',
        'announcements',
        'materials',
        'progress_entries',
        'homework_submissions',
        'homework',
        'payments',
        'attendances',
        'class_enrollments',
        'class_enrollment_requests',
        'classes',
        'students',
        'users',
    ];

    $database->pdo()->exec('SET FOREIGN_KEY_CHECKS=0');
    foreach ($tables as $table) {
        $database->pdo()->exec('TRUNCATE TABLE ' . $table);
    }
    $database->pdo()->exec('SET FOREIGN_KEY_CHECKS=1');

    $adminId = app_uuid();
    $studentPassword = password_hash('student123', PASSWORD_DEFAULT);
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);

    $database->execute(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (:id, :name, :email, :password_hash, :role)',
        [
            'id' => $adminId,
            'name' => 'Apoorwa Teacher',
            'email' => 'admin@lms.local',
            'password_hash' => $adminPassword,
            'role' => 'ADMIN',
        ]
    );

    $students = [
        ['name' => 'Nethmi Perera', 'phone' => '0771234567', 'parent_name' => 'Amila Perera'],
        ['name' => 'Dinuka Silva', 'phone' => '0712345678', 'parent_name' => 'Tharindu Silva'],
        ['name' => 'Sethmi Fernando', 'phone' => '0765551122', 'parent_name' => 'Kumari Fernando'],
        ['name' => 'Yenuli Jayasuriya', 'phone' => '0759004400', 'parent_name' => 'Sampath Jayasuriya'],
    ];

    $studentRecords = [];

    foreach ($students as $student) {
        $userId = app_uuid();
        $studentId = app_uuid();
        $qrCode = 'LMS-' . strtoupper(str_replace(' ', '-', $student['name'])) . '-' . substr(str_replace('-', '', app_uuid()), 0, 8);

        $database->execute(
            'INSERT INTO users (id, name, phone, password_hash, role) VALUES (:id, :name, :phone, :password_hash, :role)',
            [
                'id' => $userId,
                'name' => $student['name'],
                'phone' => $student['phone'],
                'password_hash' => $studentPassword,
                'role' => 'STUDENT',
            ]
        );

        $database->execute(
            'INSERT INTO students (id, name, phone, parent_name, qr_code, user_id) VALUES (:id, :name, :phone, :parent_name, :qr_code, :user_id)',
            [
                'id' => $studentId,
                'name' => $student['name'],
                'phone' => $student['phone'],
                'parent_name' => $student['parent_name'],
                'qr_code' => $qrCode,
                'user_id' => $userId,
            ]
        );

        $studentRecords[] = [
            'id' => $studentId,
            'name' => $student['name'],
            'phone' => $student['phone'],
            'qr_code' => $qrCode,
        ];
    }

    $attendanceRows = [
        [$studentRecords[0]['id'], date('Y-m-d', strtotime('-2 day')), 'PRESENT'],
        [$studentRecords[1]['id'], date('Y-m-d', strtotime('-2 day')), 'ABSENT'],
        [$studentRecords[2]['id'], date('Y-m-d', strtotime('-1 day')), 'PRESENT'],
        [$studentRecords[3]['id'], date('Y-m-d'), 'PRESENT'],
    ];

    foreach ($attendanceRows as [$studentId, $date, $status]) {
        $database->execute(
            'INSERT INTO attendances (id, student_id, date, status) VALUES (:id, :student_id, :date, :status)',
            [
                'id' => app_uuid(),
                'student_id' => $studentId,
                'date' => $date,
                'status' => $status,
            ]
        );
    }

    $paymentRows = [
        [$studentRecords[0]['id'], 3500, 'MONTHLY', 'CASH', 'PAID', date('Y-m-d', strtotime('-4 day'))],
        [$studentRecords[1]['id'], 3500, 'MONTHLY', 'ONLINE', 'PENDING', date('Y-m-d', strtotime('-1 day'))],
        [$studentRecords[2]['id'], 2000, 'CLASS', 'CASH', 'PAID', date('Y-m-d')],
    ];

    foreach ($paymentRows as [$studentId, $amount, $type, $method, $status, $date]) {
        $database->execute(
            'INSERT INTO payments (id, student_id, amount, type, method, status, date) VALUES (:id, :student_id, :amount, :type, :method, :status, :date)',
            [
                'id' => app_uuid(),
                'student_id' => $studentId,
                'amount' => $amount,
                'type' => $type,
                'method' => $method,
                'status' => $status,
                'date' => $date,
            ]
        );
    }

    $classOneId = app_uuid();
    $classTwoId = app_uuid();

    $database->execute(
        'INSERT INTO classes (id, title, subject, level, type, status, date, schedule_day, start_time, end_time, location, capacity, fee, notes, teacher_id, created_by_id)
         VALUES (:id, :title, :subject, :level, :type, :status, :date, :schedule_day, :start_time, :end_time, :location, :capacity, :fee, :notes, :teacher_id, :created_by_id)',
        [
            'id' => $classOneId,
            'title' => 'Advanced Algebra',
            'subject' => 'Mathematics',
            'level' => 'Grade 10',
            'type' => 'OFFLINE',
            'status' => 'ACTIVE',
            'date' => date('Y-m-d', strtotime('+1 day')),
            'schedule_day' => strtoupper(date('l', strtotime('+1 day'))),
            'start_time' => '09:00',
            'end_time' => '10:30',
            'location' => 'Hall A',
            'capacity' => 24,
            'fee' => 3500,
            'notes' => 'Focus on simultaneous equations and revision drills.',
            'teacher_id' => $adminId,
            'created_by_id' => $adminId,
        ]
    );

    $database->execute(
        'INSERT INTO classes (id, title, subject, level, type, status, date, schedule_day, start_time, end_time, meeting_link, capacity, fee, notes, teacher_id, created_by_id)
         VALUES (:id, :title, :subject, :level, :type, :status, :date, :schedule_day, :start_time, :end_time, :meeting_link, :capacity, :fee, :notes, :teacher_id, :created_by_id)',
        [
            'id' => $classTwoId,
            'title' => 'Physics Revision Live',
            'subject' => 'Physics',
            'level' => 'A/L Revision',
            'type' => 'ONLINE',
            'status' => 'ACTIVE',
            'date' => date('Y-m-d', strtotime('+3 day')),
            'schedule_day' => strtoupper(date('l', strtotime('+3 day'))),
            'start_time' => '18:30',
            'end_time' => '20:00',
            'meeting_link' => 'https://meet.google.com/example-live-room',
            'capacity' => 40,
            'fee' => 2000,
            'notes' => 'Recorded link shared after class.',
            'teacher_id' => $adminId,
            'created_by_id' => $adminId,
        ]
    );

    $enrollments = [
        [$classOneId, $studentRecords[0]['id']],
        [$classOneId, $studentRecords[1]['id']],
        [$classTwoId, $studentRecords[2]['id']],
        [$classTwoId, $studentRecords[3]['id']],
    ];

    foreach ($enrollments as [$classId, $studentId]) {
        $database->execute(
            'INSERT INTO class_enrollments (id, class_id, student_id) VALUES (:id, :class_id, :student_id)',
            [
                'id' => app_uuid(),
                'class_id' => $classId,
                'student_id' => $studentId,
            ]
        );
    }

    $quizId = app_uuid();

    $database->execute(
        'INSERT INTO quizzes (id, title, description, created_by_id) VALUES (:id, :title, :description, :created_by_id)',
        [
            'id' => $quizId,
            'title' => 'Fractions Mastery Quiz',
            'description' => 'Quick checkpoint for fractions, ratios, and simplification.',
            'created_by_id' => $adminId,
        ]
    );

    $questions = [
        ['Which fraction is equivalent to 3/4?', ['6/8', '4/10', '9/16', '12/20'], 0],
        ['What is 1/2 + 1/4?', ['2/4', '3/4', '1/8', '4/8'], 1],
        ['Simplify 8/12.', ['2/3', '4/5', '3/4', '5/6'], 0],
    ];

    foreach ($questions as [$prompt, $options, $correctAnswer]) {
        $database->execute(
            'INSERT INTO questions (id, quiz_id, prompt, options_json, correct_answer) VALUES (:id, :quiz_id, :prompt, :options_json, :correct_answer)',
            [
                'id' => app_uuid(),
                'quiz_id' => $quizId,
                'prompt' => $prompt,
                'options_json' => json_encode($options, JSON_THROW_ON_ERROR),
                'correct_answer' => $correctAnswer,
            ]
        );
    }

    $database->execute(
        'INSERT INTO results (id, quiz_id, student_id, answers_json, score, total_questions) VALUES (:id, :quiz_id, :student_id, :answers_json, :score, :total_questions)',
        [
            'id' => app_uuid(),
            'quiz_id' => $quizId,
            'student_id' => $studentRecords[0]['id'],
            'answers_json' => json_encode([0, 1, 0], JSON_THROW_ON_ERROR),
            'score' => 3,
            'total_questions' => 3,
        ]
    );
});

echo "Seed complete.\n";
echo "Admin login: admin@lms.local / admin123\n";
echo "Student login: 0771234567 / student123\n";

