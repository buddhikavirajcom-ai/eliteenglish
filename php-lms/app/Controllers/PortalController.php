<?php

declare(strict_types=1);

namespace PhpLms\Controllers;

use PhpLms\Core\Auth;
use PhpLms\Core\Csrf;
use PhpLms\Core\Flash;
use PhpLms\Core\SecureMySQL;
use RuntimeException;

final class PortalController
{
    private const TESTIMONIALS = [
        [
            'name' => 'Nethmi P.',
            'role' => 'Parent of a Grade 6 student',
            'quote' => 'The classes feel warm and very organized. My daughter understands what to study each week, and I always know how she is doing.',
            'result' => 'Better confidence in school English and more consistent homework habits',
        ],
        [
            'name' => 'Kavindu R.',
            'role' => 'Ongoing student',
            'quote' => 'Lessons are easy to follow and never confusing. I feel much more comfortable speaking in English now.',
            'result' => 'Improved speaking confidence and classroom participation',
        ],
        [
            'name' => 'Mrs. Silva',
            'role' => 'Parent of two learners',
            'quote' => 'What I appreciate most is the communication. It feels personal, professional, and simple enough for busy parents.',
            'result' => 'Clear progress visibility without a complicated system',
        ],
    ];

    private const FAQS = [
        [
            'question' => 'Who are these classes for?',
            'answer' => 'The classes are best for school students who want better English results, stronger confidence, and a more supportive weekly routine.',
        ],
        [
            'question' => 'Are classes online or in person?',
            'answer' => 'The website shows the delivery mode for each class. Some sessions are live online, while others may be offered in person depending on the current schedule.',
        ],
        [
            'question' => 'How do parents stay updated?',
            'answer' => 'After enrollment, parents can use the portal to follow homework, attendance, class updates, and progress in a simple format.',
        ],
        [
            'question' => 'Can I ask which class is right before enrolling?',
            'answer' => 'Yes. The contact page is public so families can ask about level, schedule, fees, and suitability before joining.',
        ],
        [
            'question' => 'Do you offer personal support for struggling students?',
            'answer' => 'Yes. The teaching style is built around clear explanation, patient guidance, and consistent support for students who need more structure.',
        ],
    ];

    public function __construct(
        private readonly SecureMySQL $db,
        private readonly Auth $auth
    ) {
    }

    public function dispatch(string $path): void
    {
        if (isset($_GET['download'])) {
            $this->download((string) $_GET['download']);
            return;
        }

        if ($path === '/about-teacher') {
            $this->about();
            return;
        }

        if ($path === '/contact-teacher') {
            $this->contact();
            return;
        }

        if (preg_match('#^/classes/([^/]+)/enroll$#', $path, $matches) === 1) {
            $_GET['class_id'] = $matches[1];
            $this->publicEnroll();
            return;
        }

        if (preg_match('#^/dashboard/quizzes/attempt/([^/]+)$#', $path, $matches) === 1) {
            $_GET['quiz'] = $matches[1];
            $this->quizzes();
            return;
        }

        if (preg_match('#^/dashboard/students/([^/]+)$#', $path, $matches) === 1) {
            $_GET['view'] = $matches[1];
            $this->students();
            return;
        }

        match ($path) {
            '/' => $this->home(),
            '/about' => $this->about(),
            '/classes' => $this->publicClasses(),
            '/classes/enroll' => $this->publicEnroll(),
            '/contact' => $this->contact(),
            '/faq' => $this->faq(),
            '/testimonials' => $this->testimonials(),
            '/login' => $this->login(),
            '/logout' => $this->logout(),
            '/dashboard' => $this->dashboard(),
            '/dashboard/students' => $this->students(),
            '/dashboard/attendance' => $this->attendance(),
            '/dashboard/payments' => $this->payments(),
            '/dashboard/classes' => $this->classes(),
            '/dashboard/progress' => $this->progress(),
            '/dashboard/homework' => $this->homework(),
            '/dashboard/materials' => $this->materials(),
            '/dashboard/messages' => $this->messages(),
            '/dashboard/quizzes' => $this->quizzes(),
            default => $this->notFound(),
        };
    }

    private function home(): void
    {
        $teacher = $this->teacherProfile();
        $classes = array_slice($this->publicClassList(), 0, 4);
        $announcements = $this->db->fetchAll(
            'SELECT a.title, a.message, a.created_at, u.name AS author_name
             FROM announcements a
             JOIN users u ON u.id = a.created_by_id
             ORDER BY a.created_at DESC
             LIMIT 3'
        );

        $this->render('pages/public/home.php', [
            'title' => 'Home',
            'teacher' => $teacher,
            'classes' => $classes,
            'announcements' => $announcements,
            'testimonials' => self::TESTIMONIALS,
        ]);
    }

    private function about(): void
    {
        $this->render('pages/public/about.php', [
            'title' => 'About',
            'teacher' => $this->teacherProfile(),
        ]);
    }

    private function publicClasses(): void
    {
        $this->render('pages/public/classes.php', [
            'title' => 'Classes',
            'teacher' => $this->teacherProfile(),
            'classes' => $this->publicClassList(),
        ]);
    }

    private function publicEnroll(): void
    {
        $classId = (string) ($_GET['class_id'] ?? '');
        $requestId = (string) ($_GET['request'] ?? '');
        $class = $classId !== '' ? $this->findClass($classId) : null;
        $request = $requestId !== '' ? $this->findEnrollmentRequest($requestId) : null;

        if (app_is_post()) {
            $this->verifyCsrf();
            $action = (string) app_input('action');

            try {
                if ($action === 'create_request') {
                    $this->createEnrollmentRequest();
                } elseif ($action === 'upload_payment') {
                    $this->uploadPaymentSlip();
                }
            } catch (RuntimeException $exception) {
                Flash::error($exception->getMessage());
            }
        }

        $this->render('pages/public/enroll.php', [
            'title' => 'Enroll',
            'class' => $class,
            'request' => $request,
        ]);
    }

    private function contact(): void
    {
        $this->render('pages/public/contact.php', [
            'title' => 'Contact',
            'teacher' => $this->teacherProfile(),
            'classes' => array_slice($this->publicClassList(), 0, 4),
        ]);
    }

    private function faq(): void
    {
        $this->render('pages/public/faq.php', [
            'title' => 'FAQ',
            'faqs' => self::FAQS,
        ]);
    }

    private function testimonials(): void
    {
        $this->render('pages/public/testimonials.php', [
            'title' => 'Testimonials',
            'items' => self::TESTIMONIALS,
        ]);
    }

    private function login(): void
    {
        if ($this->auth->check()) {
            app_redirect('dashboard');
        }

        if (app_is_post()) {
            $this->verifyCsrf();
            $identifier = trim((string) app_input('identifier', ''));
            $password = (string) app_input('password', '');

            if ($identifier === '' || strlen($password) < 6) {
                Flash::error('Enter a valid email or phone number and a password with at least 6 characters.');
            } elseif (!$this->auth->attempt($identifier, $password)) {
                Flash::error('Invalid login credentials.');
            } else {
                app_redirect('dashboard');
            }
        }

        $this->render('pages/auth/login.php', ['title' => 'Login']);
    }

    private function logout(): void
    {
        if (app_is_post()) {
            $this->verifyCsrf();
            $this->auth->logout();
        }

        app_redirect('');
    }

    private function dashboard(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin()) {
            $stats = [
                'students' => (int) $this->db->scalar('SELECT COUNT(*) FROM students'),
                'paid_total' => (float) ($this->db->scalar("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'PAID'") ?? 0),
                'upcoming_classes' => (int) $this->db->scalar("SELECT COUNT(*) FROM classes WHERE status IN ('ACTIVE', 'DRAFT')"),
            ];

            $attendanceSummary = $this->db->fetchAll("SELECT status, COUNT(*) AS total FROM attendances GROUP BY status");
            $present = 0;
            $attendanceTotal = 0;
            foreach ($attendanceSummary as $row) {
                $attendanceTotal += (int) $row['total'];
                if ($row['status'] === 'PRESENT') {
                    $present = (int) $row['total'];
                }
            }
            $stats['attendance_rate'] = $attendanceTotal > 0 ? ($present / $attendanceTotal) * 100 : 0;

            $activities = $this->db->fetchAll(
                '(SELECT created_at AS activity_at, "Payment recorded" AS title, CONCAT(s.name, " ", LOWER(p.status), " ", FORMAT(p.amount, 2)) AS description
                  FROM payments p
                  JOIN students s ON s.id = p.student_id
                  ORDER BY p.created_at DESC
                  LIMIT 4)
                 UNION ALL
                 (SELECT created_at AS activity_at, "Attendance updated" AS title, CONCAT(s.name, " marked ", LOWER(a.status)) AS description
                  FROM attendances a
                  JOIN students s ON s.id = a.student_id
                  ORDER BY a.created_at DESC
                  LIMIT 4)
                 UNION ALL
                 (SELECT submitted_at AS activity_at, "Quiz submitted" AS title, CONCAT(s.name, " scored ", r.score, "/", r.total_questions, " on ", q.title) AS description
                  FROM results r
                  JOIN students s ON s.id = r.student_id
                  JOIN quizzes q ON q.id = r.quiz_id
                  ORDER BY r.submitted_at DESC
                  LIMIT 4)
                 ORDER BY activity_at DESC
                 LIMIT 8'
            );

            $classes = $this->db->fetchAll(
                'SELECT c.*, u.name AS teacher_name, COUNT(e.id) AS enrolled_count
                 FROM classes c
                 JOIN users u ON u.id = c.teacher_id
                 LEFT JOIN class_enrollments e ON e.class_id = c.id
                 WHERE c.status IN ("ACTIVE", "DRAFT")
                 GROUP BY c.id
                 ORDER BY c.date ASC, c.start_time ASC
                 LIMIT 6'
            );

            $this->render('pages/dashboard/index.php', [
                'title' => 'Dashboard',
                'mode' => 'admin',
                'stats' => $stats,
                'activities' => $activities,
                'classes' => $classes,
            ]);
            return;
        }

        $studentId = $this->auth->studentId();
        $student = $this->studentProfile((string) $studentId);

        $this->render('pages/dashboard/index.php', [
            'title' => 'Dashboard',
            'mode' => 'student',
            'student' => $student,
        ]);
    }

    private function students(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin()) {
            if (app_is_post()) {
                $this->verifyCsrf();
                $this->handleStudentSubmit();
            }

            $editStudent = null;
            if (!empty($_GET['edit'])) {
                $editStudent = $this->db->fetch(
                    'SELECT s.*, u.email, u.id AS user_id
                     FROM students s
                     JOIN users u ON u.id = s.user_id
                     WHERE s.id = :id
                     LIMIT 1',
                    ['id' => (string) $_GET['edit']]
                );
            }

            $students = $this->db->fetchAll(
                'SELECT s.*, u.email, u.created_at AS user_created_at
                 FROM students s
                 JOIN users u ON u.id = s.user_id
                 ORDER BY s.created_at DESC'
            );

            $selectedStudent = null;
            if (!empty($_GET['view'])) {
                $selectedStudent = $this->studentProfile((string) $_GET['view']);
            }

            $this->render('pages/students/index.php', [
                'title' => 'Students',
                'mode' => 'admin',
                'students' => $students,
                'editStudent' => $editStudent,
                'selectedStudent' => $selectedStudent,
            ]);
            return;
        }

        $this->render('pages/students/index.php', [
            'title' => 'Student Profile',
            'mode' => 'student',
            'student' => $this->studentProfile((string) $this->auth->studentId()),
        ]);
    }

    private function attendance(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin() && app_is_post()) {
            $this->verifyCsrf();
            $this->handleAttendanceSubmit();
        }

        if ($this->auth->isAdmin()) {
            $students = $this->db->fetchAll('SELECT id, name, qr_code FROM students ORDER BY name ASC');
            $records = $this->db->fetchAll(
                'SELECT a.*, s.name AS student_name
                 FROM attendances a
                 JOIN students s ON s.id = a.student_id
                 ORDER BY a.date DESC, a.created_at DESC
                 LIMIT 100'
            );

            $this->render('pages/attendance/index.php', [
                'title' => 'Attendance',
                'mode' => 'admin',
                'students' => $students,
                'records' => $records,
            ]);
            return;
        }

        $records = $this->db->fetchAll(
            'SELECT *
             FROM attendances
             WHERE student_id = :student_id
             ORDER BY date DESC',
            ['student_id' => (string) $this->auth->studentId()]
        );

        $this->render('pages/attendance/index.php', [
            'title' => 'Attendance',
            'mode' => 'student',
            'records' => $records,
        ]);
    }

    private function payments(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin() && app_is_post()) {
            $this->verifyCsrf();
            $this->handlePaymentSubmit();
        }

        if ($this->auth->isAdmin()) {
            $students = $this->db->fetchAll('SELECT id, name FROM students ORDER BY name ASC');
            $payments = $this->db->fetchAll(
                'SELECT p.*, s.name AS student_name
                 FROM payments p
                 JOIN students s ON s.id = p.student_id
                 ORDER BY p.date DESC, p.created_at DESC
                 LIMIT 100'
            );

            $this->render('pages/payments/index.php', [
                'title' => 'Payments',
                'mode' => 'admin',
                'students' => $students,
                'payments' => $payments,
            ]);
            return;
        }

        $payments = $this->db->fetchAll(
            'SELECT *
             FROM payments
             WHERE student_id = :student_id
             ORDER BY date DESC',
            ['student_id' => (string) $this->auth->studentId()]
        );

        $this->render('pages/payments/index.php', [
            'title' => 'Payments',
            'mode' => 'student',
            'payments' => $payments,
        ]);
    }

    private function classes(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin() && app_is_post()) {
            $this->verifyCsrf();
            $this->handleClassSubmit();
        }

        if ($this->auth->isAdmin()) {
            $teachers = $this->db->fetchAll("SELECT id, name, email, phone FROM users WHERE role = 'ADMIN' ORDER BY name ASC");
            $students = $this->db->fetchAll('SELECT id, name FROM students ORDER BY name ASC');
            $classes = $this->db->fetchAll(
                'SELECT c.*, u.name AS teacher_name, COUNT(e.id) AS enrolled_count
                 FROM classes c
                 JOIN users u ON u.id = c.teacher_id
                 LEFT JOIN class_enrollments e ON e.class_id = c.id
                 GROUP BY c.id
                 ORDER BY c.date ASC, c.start_time ASC'
            );
            $enrollmentRequests = $this->db->fetchAll(
                'SELECT r.*, c.title AS class_title, c.fee
                 FROM class_enrollment_requests r
                 JOIN classes c ON c.id = r.class_id
                 ORDER BY r.created_at DESC'
            );

            $editClass = null;
            $editStudentIds = [];
            if (!empty($_GET['edit'])) {
                $editClass = $this->findClass((string) $_GET['edit']);
                $editStudentIds = array_column(
                    $this->db->fetchAll('SELECT student_id FROM class_enrollments WHERE class_id = :class_id', ['class_id' => (string) $_GET['edit']]),
                    'student_id'
                );
            }

            $this->render('pages/classes/index.php', [
                'title' => 'Classes',
                'mode' => 'admin',
                'teachers' => $teachers,
                'students' => $students,
                'classes' => $classes,
                'enrollmentRequests' => $enrollmentRequests,
                'editClass' => $editClass,
                'editStudentIds' => $editStudentIds,
            ]);
            return;
        }

        $classes = $this->db->fetchAll(
            'SELECT c.*, u.name AS teacher_name
             FROM class_enrollments e
             JOIN classes c ON c.id = e.class_id
             JOIN users u ON u.id = c.teacher_id
             WHERE e.student_id = :student_id
             ORDER BY c.date ASC, c.start_time ASC',
            ['student_id' => (string) $this->auth->studentId()]
        );

        $this->render('pages/classes/index.php', [
            'title' => 'Classes',
            'mode' => 'student',
            'classes' => $classes,
        ]);
    }

    private function progress(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin() && app_is_post()) {
            $this->verifyCsrf();
            $this->handleProgressSubmit();
        }

        if ($this->auth->isAdmin()) {
            $students = $this->db->fetchAll('SELECT id, name FROM students ORDER BY name ASC');
            $entries = $this->db->fetchAll(
                'SELECT p.*, s.name AS student_name, u.name AS teacher_name
                 FROM progress_entries p
                 JOIN students s ON s.id = p.student_id
                 JOIN users u ON u.id = p.created_by_id
                 ORDER BY p.month DESC, s.name ASC'
            );

            $this->render('pages/progress/index.php', [
                'title' => 'Progress',
                'mode' => 'admin',
                'students' => $students,
                'entries' => $entries,
            ]);
            return;
        }

        $entries = $this->db->fetchAll(
            'SELECT *
             FROM progress_entries
             WHERE student_id = :student_id
             ORDER BY month DESC',
            ['student_id' => (string) $this->auth->studentId()]
        );

        $this->render('pages/progress/index.php', [
            'title' => 'Progress',
            'mode' => 'student',
            'entries' => $entries,
        ]);
    }

    private function homework(): void
    {
        $this->requireAuth();

        if (app_is_post()) {
            $this->verifyCsrf();
            $this->handleHomeworkSubmit();
        }

        if ($this->auth->isAdmin()) {
            $classes = $this->db->fetchAll('SELECT id, title FROM classes ORDER BY date ASC, start_time ASC');
            $homework = $this->db->fetchAll(
                'SELECT h.*, c.title AS class_title, u.name AS teacher_name
                 FROM homework h
                 JOIN classes c ON c.id = h.class_id
                 JOIN users u ON u.id = h.created_by_id
                 ORDER BY h.deadline ASC, h.created_at DESC'
            );
            $submissions = $this->db->fetchAll(
                'SELECT hs.*, h.title AS homework_title, s.name AS student_name
                 FROM homework_submissions hs
                 JOIN homework h ON h.id = hs.homework_id
                 JOIN students s ON s.id = hs.student_id
                 ORDER BY hs.updated_at DESC'
            );

            $this->render('pages/homework/index.php', [
                'title' => 'Homework',
                'mode' => 'admin',
                'classes' => $classes,
                'homework' => $homework,
                'submissions' => $submissions,
            ]);
            return;
        }

        $items = $this->db->fetchAll(
            'SELECT h.*, c.title AS class_title, hs.id AS submission_id, hs.status, hs.feedback, hs.score, hs.max_score, hs.response_name
             FROM class_enrollments e
             JOIN homework h ON h.class_id = e.class_id
             JOIN classes c ON c.id = h.class_id
             LEFT JOIN homework_submissions hs ON hs.homework_id = h.id AND hs.student_id = e.student_id
             WHERE e.student_id = :student_id
             ORDER BY h.deadline ASC',
            ['student_id' => (string) $this->auth->studentId()]
        );

        $this->render('pages/homework/index.php', [
            'title' => 'Homework',
            'mode' => 'student',
            'items' => $items,
        ]);
    }

    private function materials(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin() && app_is_post()) {
            $this->verifyCsrf();
            $this->handleMaterialSubmit();
        }

        $materials = $this->db->fetchAll(
            'SELECT m.*, u.name AS teacher_name
             FROM materials m
             JOIN users u ON u.id = m.created_by_id
             ORDER BY m.created_at DESC'
        );

        $this->render('pages/materials/index.php', [
            'title' => 'Materials',
            'mode' => $this->auth->isAdmin() ? 'admin' : 'student',
            'materials' => $materials,
        ]);
    }

    private function messages(): void
    {
        $this->requireAuth();

        if ($this->auth->isAdmin() && app_is_post()) {
            $this->verifyCsrf();
            $this->handleMessageSubmit();
        }

        $messages = $this->db->fetchAll(
            'SELECT a.*, u.name AS author_name
             FROM announcements a
             JOIN users u ON u.id = a.created_by_id
             ORDER BY a.created_at DESC'
        );

        $this->render('pages/messages/index.php', [
            'title' => 'Messages',
            'mode' => $this->auth->isAdmin() ? 'admin' : 'student',
            'messages' => $messages,
        ]);
    }

    private function quizzes(): void
    {
        $this->requireAuth();

        if (app_is_post()) {
            $this->verifyCsrf();
            $this->handleQuizSubmit();
        }

        if ($this->auth->isAdmin()) {
            $quizzes = $this->db->fetchAll(
                'SELECT q.*, u.name AS teacher_name, COUNT(qq.id) AS question_count
                 FROM quizzes q
                 JOIN users u ON u.id = q.created_by_id
                 LEFT JOIN questions qq ON qq.quiz_id = q.id
                 GROUP BY q.id
                 ORDER BY q.created_at DESC'
            );
            $results = $this->db->fetchAll(
                'SELECT r.*, s.name AS student_name, q.title AS quiz_title
                 FROM results r
                 JOIN students s ON s.id = r.student_id
                 JOIN quizzes q ON q.id = r.quiz_id
                 ORDER BY r.submitted_at DESC'
            );

            $this->render('pages/quizzes/index.php', [
                'title' => 'Quizzes',
                'mode' => 'admin',
                'quizzes' => $quizzes,
                'results' => $results,
            ]);
            return;
        }

        $quizId = (string) ($_GET['quiz'] ?? '');
        $selectedQuiz = $quizId !== '' ? $this->findQuizWithQuestions($quizId) : null;
        $selectedQuizResult = null;
        if ($selectedQuiz) {
            $selectedQuizResult = $this->db->fetch(
                'SELECT * FROM results WHERE quiz_id = :quiz_id AND student_id = :student_id LIMIT 1',
                [
                    'quiz_id' => $selectedQuiz['id'],
                    'student_id' => (string) $this->auth->studentId(),
                ]
            );
            if ($selectedQuizResult) {
                $selectedQuizResult['answers'] = json_decode((string) $selectedQuizResult['answers_json'], true) ?: [];
            }
        }
        $quizzes = $this->db->fetchAll(
            'SELECT q.*, r.id AS result_id, r.score, r.total_questions
             FROM quizzes q
             LEFT JOIN results r ON r.quiz_id = q.id AND r.student_id = :student_id
             WHERE q.is_published = 1
             ORDER BY q.created_at DESC',
            ['student_id' => (string) $this->auth->studentId()]
        );

        $this->render('pages/quizzes/index.php', [
            'title' => 'Quizzes',
            'mode' => 'student',
            'quizzes' => $quizzes,
            'selectedQuiz' => $selectedQuiz,
            'selectedQuizResult' => $selectedQuizResult,
        ]);
    }

    private function notFound(): void
    {
        http_response_code(404);
        $this->render('pages/public/not-found.php', ['title' => 'Not found']);
    }

    private function handleStudentSubmit(): void
    {
        $action = (string) app_input('action');

        if ($action === 'delete') {
            $id = (string) app_input('student_id');
            $student = $this->db->fetch('SELECT user_id FROM students WHERE id = :id', ['id' => $id]);
            if ($student) {
                $this->db->execute('DELETE FROM users WHERE id = :id', ['id' => $student['user_id']]);
                Flash::success('Student deleted.');
            }
            app_redirect('dashboard/students');
        }

        $studentId = (string) app_input('student_id', '');
        $name = trim((string) app_input('name', ''));
        $phone = trim((string) app_input('phone', ''));
        $email = trim((string) app_input('email', ''));
        $parentName = trim((string) app_input('parent_name', ''));
        $parentContact = trim((string) app_input('parent_contact', ''));
        $grade = trim((string) app_input('grade', ''));
        $school = trim((string) app_input('school', ''));
        $learningLevel = trim((string) app_input('learning_level', ''));
        $notes = trim((string) app_input('notes', ''));
        $password = (string) app_input('password', '');

        if ($name === '' || $phone === '' || $parentName === '') {
            Flash::error('Name, phone, and parent name are required.');
            return;
        }

        if ($studentId === '') {
            if (strlen($password) < 6) {
                Flash::error('A password with at least 6 characters is required for new students.');
                return;
            }

            $userId = \app_uuid();
            $studentId = \app_uuid();
            $qrCode = 'LMS-' . strtoupper(str_replace(' ', '-', $name)) . '-' . substr(str_replace('-', '', \app_uuid()), 0, 8);

            $this->db->transaction(function (SecureMySQL $db) use ($userId, $studentId, $name, $phone, $email, $password, $parentName, $parentContact, $grade, $school, $learningLevel, $notes, $qrCode): void {
                $db->execute(
                    'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (:id, :name, :email, :phone, :password_hash, :role)',
                    [
                        'id' => $userId,
                        'name' => $name,
                        'email' => $email !== '' ? strtolower($email) : null,
                        'phone' => $phone,
                        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                        'role' => 'STUDENT',
                    ]
                );

                $db->execute(
                    'INSERT INTO students (id, name, phone, parent_name, parent_contact, grade, school, learning_level, notes, qr_code, user_id)
                     VALUES (:id, :name, :phone, :parent_name, :parent_contact, :grade, :school, :learning_level, :notes, :qr_code, :user_id)',
                    [
                        'id' => $studentId,
                        'name' => $name,
                        'phone' => $phone,
                        'parent_name' => $parentName,
                        'parent_contact' => $parentContact !== '' ? $parentContact : null,
                        'grade' => $grade !== '' ? $grade : null,
                        'school' => $school !== '' ? $school : null,
                        'learning_level' => $learningLevel !== '' ? $learningLevel : null,
                        'notes' => $notes !== '' ? $notes : null,
                        'qr_code' => $qrCode,
                        'user_id' => $userId,
                    ]
                );
            });
            Flash::success('Student created.');
            app_redirect('dashboard/students');
        }

        $student = $this->db->fetch('SELECT user_id FROM students WHERE id = :id', ['id' => $studentId]);
        if (!$student) {
            Flash::error('Student not found.');
            return;
        }

        $this->db->transaction(function (SecureMySQL $db) use ($student, $studentId, $name, $phone, $email, $password, $parentName, $parentContact, $grade, $school, $learningLevel, $notes): void {
            $params = [
                'id' => $student['user_id'],
                'name' => $name,
                'email' => $email !== '' ? strtolower($email) : null,
                'phone' => $phone,
            ];

            $sql = 'UPDATE users SET name = :name, email = :email, phone = :phone';
            if ($password !== '') {
                $sql .= ', password_hash = :password_hash';
                $params['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
            }
            $sql .= ' WHERE id = :id';
            $db->execute($sql, $params);

            $db->execute(
                'UPDATE students
                 SET name = :name, phone = :phone, parent_name = :parent_name, parent_contact = :parent_contact,
                     grade = :grade, school = :school, learning_level = :learning_level, notes = :notes
                 WHERE id = :id',
                [
                    'id' => $studentId,
                    'name' => $name,
                    'phone' => $phone,
                    'parent_name' => $parentName,
                    'parent_contact' => $parentContact !== '' ? $parentContact : null,
                    'grade' => $grade !== '' ? $grade : null,
                    'school' => $school !== '' ? $school : null,
                    'learning_level' => $learningLevel !== '' ? $learningLevel : null,
                    'notes' => $notes !== '' ? $notes : null,
                ]
            );
        });

        Flash::success('Student updated.');
        app_redirect('dashboard/students');
    }

    private function handleAttendanceSubmit(): void
    {
        $action = (string) app_input('action');
        $date = (string) app_input('date', date('Y-m-d'));

        if ($action === 'qr_scan') {
            $qrCode = trim((string) app_input('qr_code', ''));
            $student = $this->db->fetch('SELECT id FROM students WHERE qr_code = :qr_code', ['qr_code' => $qrCode]);
            if (!$student) {
                Flash::error('QR code not found.');
                return;
            }
            $this->upsertAttendance((string) $student['id'], $date, 'PRESENT');
            Flash::success('Attendance marked from QR code.');
            return;
        }

        $studentId = (string) app_input('student_id', '');
        $status = (string) app_input('status', 'PRESENT');
        if ($studentId === '') {
            Flash::error('Select a student first.');
            return;
        }
        $this->upsertAttendance($studentId, $date, $status);
        Flash::success('Attendance saved.');
    }

    private function handlePaymentSubmit(): void
    {
        $studentId = (string) app_input('student_id', '');
        $amount = (float) app_input('amount', 0);
        $type = (string) app_input('type', 'MONTHLY');
        $method = (string) app_input('method', 'CASH');
        $status = (string) app_input('status', 'PAID');
        $date = (string) app_input('date', date('Y-m-d'));

        if ($studentId === '' || $amount <= 0) {
            Flash::error('Select a student and enter a valid amount.');
            return;
        }

        $this->db->execute(
            'INSERT INTO payments (id, student_id, amount, type, method, status, date)
             VALUES (:id, :student_id, :amount, :type, :method, :status, :date)',
            [
                'id' => \app_uuid(),
                'student_id' => $studentId,
                'amount' => $amount,
                'type' => $type,
                'method' => $method,
                'status' => $status,
                'date' => $date,
            ]
        );

        Flash::success('Payment recorded.');
    }

    private function handleClassSubmit(): void
    {
        $action = (string) app_input('action');

        if ($action === 'delete') {
            $this->db->execute('DELETE FROM classes WHERE id = :id', ['id' => (string) app_input('class_id')]);
            Flash::success('Class deleted.');
            app_redirect('dashboard/classes');
        }

        if ($action === 'review_request') {
            $this->reviewEnrollmentRequest();
            return;
        }

        $classId = (string) app_input('class_id', '');
        $title = trim((string) app_input('title', ''));
        $subject = trim((string) app_input('subject', ''));
        $teacherId = (string) app_input('teacher_id', '');
        $level = trim((string) app_input('level', ''));
        $type = (string) app_input('type', 'ONLINE');
        $status = (string) app_input('status', 'ACTIVE');
        $date = (string) app_input('date', date('Y-m-d'));
        $scheduleDay = (string) app_input('schedule_day', strtoupper(date('l')));
        $startTime = (string) app_input('start_time', '09:00');
        $endTime = (string) app_input('end_time', '10:00');
        $meetingLink = trim((string) app_input('meeting_link', ''));
        $location = trim((string) app_input('location', ''));
        $capacity = max(1, (int) app_input('capacity', 20));
        $fee = max(0, (float) app_input('fee', 0));
        $notes = trim((string) app_input('notes', ''));
        $studentIds = array_values(array_filter((array) ($_POST['student_ids'] ?? [])));

        if ($title === '' || $subject === '' || $teacherId === '' || $level === '') {
            Flash::error('Title, subject, teacher, and level are required.');
            return;
        }

        if ($type === 'ONLINE' && $meetingLink === '') {
            Flash::error('Online classes require a meeting link.');
            return;
        }
        if ($type === 'OFFLINE' && $location === '') {
            Flash::error('Offline classes require a location.');
            return;
        }

        if ($classId === '') {
            $classId = \app_uuid();
            $this->db->execute(
                'INSERT INTO classes (id, title, subject, level, type, status, date, schedule_day, start_time, end_time, meeting_link, location, capacity, fee, notes, teacher_id, created_by_id)
                 VALUES (:id, :title, :subject, :level, :type, :status, :date, :schedule_day, :start_time, :end_time, :meeting_link, :location, :capacity, :fee, :notes, :teacher_id, :created_by_id)',
                [
                    'id' => $classId,
                    'title' => $title,
                    'subject' => $subject,
                    'level' => $level,
                    'type' => $type,
                    'status' => $status,
                    'date' => $date,
                    'schedule_day' => $scheduleDay,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'meeting_link' => $meetingLink !== '' ? $meetingLink : null,
                    'location' => $location !== '' ? $location : null,
                    'capacity' => $capacity,
                    'fee' => $fee,
                    'notes' => $notes !== '' ? $notes : null,
                    'teacher_id' => $teacherId,
                    'created_by_id' => (string) $this->auth->id(),
                ]
            );
        } else {
            $this->db->execute(
                'UPDATE classes
                 SET title = :title, subject = :subject, level = :level, type = :type, status = :status, date = :date,
                     schedule_day = :schedule_day, start_time = :start_time, end_time = :end_time, meeting_link = :meeting_link,
                     location = :location, capacity = :capacity, fee = :fee, notes = :notes, teacher_id = :teacher_id
                 WHERE id = :id',
                [
                    'id' => $classId,
                    'title' => $title,
                    'subject' => $subject,
                    'level' => $level,
                    'type' => $type,
                    'status' => $status,
                    'date' => $date,
                    'schedule_day' => $scheduleDay,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'meeting_link' => $meetingLink !== '' ? $meetingLink : null,
                    'location' => $location !== '' ? $location : null,
                    'capacity' => $capacity,
                    'fee' => $fee,
                    'notes' => $notes !== '' ? $notes : null,
                    'teacher_id' => $teacherId,
                ]
            );
            $this->db->execute('DELETE FROM class_enrollments WHERE class_id = :class_id', ['class_id' => $classId]);
        }

        foreach ($studentIds as $studentId) {
            $this->db->execute(
                'INSERT INTO class_enrollments (id, class_id, student_id) VALUES (:id, :class_id, :student_id)',
                [
                    'id' => \app_uuid(),
                    'class_id' => $classId,
                    'student_id' => (string) $studentId,
                ]
            );
        }

        Flash::success($action === 'update' ? 'Class updated.' : 'Class created.');
        app_redirect('dashboard/classes');
    }

    private function handleProgressSubmit(): void
    {
        $studentId = (string) app_input('student_id', '');
        $month = trim((string) app_input('month', ''));
        $listening = (int) app_input('listening', 1);
        $reading = (int) app_input('reading', 1);
        $writing = (int) app_input('writing', 1);
        $speaking = (int) app_input('speaking', 1);
        $comment = trim((string) app_input('comment', ''));
        $testMark = trim((string) app_input('test_mark', ''));

        if ($studentId === '' || $month === '') {
            Flash::error('Student and month are required.');
            return;
        }

        $date = $month . '-01';
        $existing = $this->db->fetch(
            'SELECT id FROM progress_entries WHERE student_id = :student_id AND month = :month LIMIT 1',
            ['student_id' => $studentId, 'month' => $date]
        );

        if ($existing) {
            $this->db->execute(
                'UPDATE progress_entries
                 SET listening = :listening, reading = :reading, writing = :writing, speaking = :speaking, comment = :comment, test_mark = :test_mark
                 WHERE id = :id',
                [
                    'id' => $existing['id'],
                    'listening' => $listening,
                    'reading' => $reading,
                    'writing' => $writing,
                    'speaking' => $speaking,
                    'comment' => $comment !== '' ? $comment : null,
                    'test_mark' => $testMark !== '' ? (int) $testMark : null,
                ]
            );
            Flash::success('Progress entry updated.');
            return;
        }

        $this->db->execute(
            'INSERT INTO progress_entries (id, student_id, month, listening, reading, writing, speaking, comment, test_mark, created_by_id)
             VALUES (:id, :student_id, :month, :listening, :reading, :writing, :speaking, :comment, :test_mark, :created_by_id)',
            [
                'id' => \app_uuid(),
                'student_id' => $studentId,
                'month' => $date,
                'listening' => $listening,
                'reading' => $reading,
                'writing' => $writing,
                'speaking' => $speaking,
                'comment' => $comment !== '' ? $comment : null,
                'test_mark' => $testMark !== '' ? (int) $testMark : null,
                'created_by_id' => (string) $this->auth->id(),
            ]
        );
        Flash::success('Progress entry created.');
    }

    private function handleHomeworkSubmit(): void
    {
        if ($this->auth->isAdmin()) {
            $action = (string) app_input('action');

            if ($action === 'review_submission') {
                $submissionId = (string) app_input('submission_id', '');
                $feedback = trim((string) app_input('feedback', ''));
                $score = trim((string) app_input('score', ''));
                $maxScore = trim((string) app_input('max_score', ''));
                $status = (string) app_input('status', 'REVIEWED');

                $this->db->execute(
                    'UPDATE homework_submissions
                     SET feedback = :feedback, score = :score, max_score = :max_score, status = :status, reviewed_at = NOW()
                     WHERE id = :id',
                    [
                        'id' => $submissionId,
                        'feedback' => $feedback !== '' ? $feedback : null,
                        'score' => $score !== '' ? (int) $score : null,
                        'max_score' => $maxScore !== '' ? (int) $maxScore : null,
                        'status' => $status,
                    ]
                );
                Flash::success('Homework submission reviewed.');
                return;
            }

            $classId = (string) app_input('class_id', '');
            $title = trim((string) app_input('title', ''));
            $description = trim((string) app_input('description', ''));
            $deadline = (string) app_input('deadline', date('Y-m-d'));
            $upload = $this->saveUpload('attachment', 'homework', ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg']);

            if ($classId === '' || $title === '') {
                Flash::error('Class and title are required.');
                return;
            }

            $this->db->execute(
                'INSERT INTO homework (id, class_id, title, description, deadline, attachment_name, attachment_path, created_by_id)
                 VALUES (:id, :class_id, :title, :description, :deadline, :attachment_name, :attachment_path, :created_by_id)',
                [
                    'id' => \app_uuid(),
                    'class_id' => $classId,
                    'title' => $title,
                    'description' => $description !== '' ? $description : null,
                    'deadline' => $deadline,
                    'attachment_name' => $upload['original_name'] ?? null,
                    'attachment_path' => $upload['relative_path'] ?? null,
                    'created_by_id' => (string) $this->auth->id(),
                ]
            );
            Flash::success('Homework created.');
            return;
        }

        $homeworkId = (string) app_input('homework_id', '');
        $upload = $this->saveUpload('response_file', 'homework', ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg']);
        if ($homeworkId === '' || !$upload) {
            Flash::error('Choose a homework item and upload a response file.');
            return;
        }

        $studentId = (string) $this->auth->studentId();
        $existing = $this->db->fetch(
            'SELECT id FROM homework_submissions WHERE homework_id = :homework_id AND student_id = :student_id LIMIT 1',
            ['homework_id' => $homeworkId, 'student_id' => $studentId]
        );

        if ($existing) {
            $this->db->execute(
                'UPDATE homework_submissions
                 SET response_name = :response_name, response_path = :response_path, status = "SUBMITTED", submitted_at = NOW()
                 WHERE id = :id',
                [
                    'id' => $existing['id'],
                    'response_name' => $upload['original_name'],
                    'response_path' => $upload['relative_path'],
                ]
            );
        } else {
            $this->db->execute(
                'INSERT INTO homework_submissions (id, homework_id, student_id, status, response_name, response_path, submitted_at)
                 VALUES (:id, :homework_id, :student_id, "SUBMITTED", :response_name, :response_path, NOW())',
                [
                    'id' => \app_uuid(),
                    'homework_id' => $homeworkId,
                    'student_id' => $studentId,
                    'response_name' => $upload['original_name'],
                    'response_path' => $upload['relative_path'],
                ]
            );
        }

        Flash::success('Homework submitted.');
    }

    private function handleMaterialSubmit(): void
    {
        $title = trim((string) app_input('title', ''));
        $category = (string) app_input('category', 'WORKSHEET');
        $description = trim((string) app_input('description', ''));
        $upload = $this->saveUpload('material_file', 'materials', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'png', 'jpg', 'jpeg']);

        if ($title === '' || !$upload) {
            Flash::error('Title and material file are required.');
            return;
        }

        $this->db->execute(
            'INSERT INTO materials (id, title, category, description, file_name, file_path, created_by_id)
             VALUES (:id, :title, :category, :description, :file_name, :file_path, :created_by_id)',
            [
                'id' => \app_uuid(),
                'title' => $title,
                'category' => $category,
                'description' => $description !== '' ? $description : null,
                'file_name' => $upload['original_name'],
                'file_path' => $upload['relative_path'],
                'created_by_id' => (string) $this->auth->id(),
            ]
        );

        Flash::success('Material uploaded.');
    }

    private function handleMessageSubmit(): void
    {
        $title = trim((string) app_input('title', ''));
        $message = trim((string) app_input('message', ''));

        if ($title === '' || strlen($message) < 4) {
            Flash::error('A title and a fuller message are required.');
            return;
        }

        $this->db->execute(
            'INSERT INTO announcements (id, title, message, created_by_id) VALUES (:id, :title, :message, :created_by_id)',
            [
                'id' => \app_uuid(),
                'title' => $title,
                'message' => $message,
                'created_by_id' => (string) $this->auth->id(),
            ]
        );

        Flash::success('Announcement posted.');
    }

    private function handleQuizSubmit(): void
    {
        if ($this->auth->isAdmin()) {
            $title = trim((string) app_input('title', ''));
            $description = trim((string) app_input('description', ''));
            $questionsJson = trim((string) app_input('questions_json', ''));

            if ($title === '' || $questionsJson === '') {
                Flash::error('Quiz title and questions JSON are required.');
                return;
            }

            $questions = json_decode($questionsJson, true);
            if (!is_array($questions) || $questions === []) {
                Flash::error('Questions JSON must be a valid array.');
                return;
            }

            $this->db->transaction(function (SecureMySQL $db) use ($title, $description, $questions): void {
                $quizId = \app_uuid();
                $db->execute(
                    'INSERT INTO quizzes (id, title, description, created_by_id) VALUES (:id, :title, :description, :created_by_id)',
                    [
                        'id' => $quizId,
                        'title' => $title,
                        'description' => $description !== '' ? $description : null,
                        'created_by_id' => (string) $this->auth->id(),
                    ]
                );

                foreach ($questions as $question) {
                    if (
                        !isset($question['prompt'], $question['options'], $question['correctAnswer']) ||
                        !is_array($question['options']) ||
                        $question['options'] === []
                    ) {
                        continue;
                    }

                    $db->execute(
                        'INSERT INTO questions (id, quiz_id, prompt, options_json, correct_answer)
                         VALUES (:id, :quiz_id, :prompt, :options_json, :correct_answer)',
                        [
                            'id' => \app_uuid(),
                            'quiz_id' => $quizId,
                            'prompt' => trim((string) $question['prompt']),
                            'options_json' => json_encode(array_values($question['options']), JSON_THROW_ON_ERROR),
                            'correct_answer' => (int) $question['correctAnswer'],
                        ]
                    );
                }
            });

            Flash::success('Quiz created.');
            return;
        }

        $quizId = (string) app_input('quiz_id', '');
        $quiz = $this->findQuizWithQuestions($quizId);
        if (!$quiz) {
            Flash::error('Quiz not found.');
            return;
        }

        $answers = $_POST['answers'] ?? [];
        $score = 0;
        foreach ($quiz['questions'] as $index => $question) {
            if ((int) ($answers[$index] ?? -1) === (int) $question['correct_answer']) {
                $score++;
            }
        }

        $this->db->execute(
            'INSERT INTO results (id, quiz_id, student_id, answers_json, score, total_questions, submitted_at)
             VALUES (:id, :quiz_id, :student_id, :answers_json, :score, :total_questions, NOW())
             ON DUPLICATE KEY UPDATE answers_json = VALUES(answers_json), score = VALUES(score), total_questions = VALUES(total_questions), submitted_at = NOW()',
            [
                'id' => \app_uuid(),
                'quiz_id' => $quizId,
                'student_id' => (string) $this->auth->studentId(),
                'answers_json' => json_encode($answers, JSON_THROW_ON_ERROR),
                'score' => $score,
                'total_questions' => count($quiz['questions']),
            ]
        );

        Flash::success('Quiz submitted.');
    }

    private function createEnrollmentRequest(): void
    {
        $classId = (string) app_input('class_id', '');
        $studentName = trim((string) app_input('student_name', ''));
        $studentPhone = trim((string) app_input('student_phone', ''));
        $studentEmail = trim((string) app_input('student_email', ''));
        $parentName = trim((string) app_input('parent_name', ''));
        $parentContact = trim((string) app_input('parent_contact', ''));
        $grade = trim((string) app_input('grade', ''));
        $school = trim((string) app_input('school', ''));
        $learningLevel = trim((string) app_input('learning_level', ''));
        $notes = trim((string) app_input('notes', ''));

        $class = $this->findClass($classId);
        if (!$class || $class['status'] !== 'ACTIVE') {
            throw new RuntimeException('This class is not available for enrollment.');
        }

        $existing = $this->db->fetch(
            'SELECT id FROM class_enrollment_requests
             WHERE class_id = :class_id AND student_phone = :student_phone AND status IN ("REQUESTED", "PAYMENT_SUBMITTED", "APPROVED")
             LIMIT 1',
            ['class_id' => $classId, 'student_phone' => $studentPhone]
        );

        if ($existing) {
            throw new RuntimeException('An enrollment request for this phone number is already in progress for this class.');
        }

        $requestId = \app_uuid();
        $this->db->execute(
            'INSERT INTO class_enrollment_requests
             (id, class_id, student_name, student_phone, student_email, parent_name, parent_contact, grade, school, learning_level, notes)
             VALUES
             (:id, :class_id, :student_name, :student_phone, :student_email, :parent_name, :parent_contact, :grade, :school, :learning_level, :notes)',
            [
                'id' => $requestId,
                'class_id' => $classId,
                'student_name' => $studentName,
                'student_phone' => $studentPhone,
                'student_email' => $studentEmail !== '' ? strtolower($studentEmail) : null,
                'parent_name' => $parentName,
                'parent_contact' => $parentContact !== '' ? $parentContact : null,
                'grade' => $grade !== '' ? $grade : null,
                'school' => $school !== '' ? $school : null,
                'learning_level' => $learningLevel !== '' ? $learningLevel : null,
                'notes' => $notes !== '' ? $notes : null,
            ]
        );

        Flash::success('Enrollment request created. Upload the payment slip next.');
        app_redirect('classes/enroll?class_id=' . urlencode($classId) . '&request=' . urlencode($requestId));
    }

    private function uploadPaymentSlip(): void
    {
        $requestId = (string) app_input('request_id', '');
        $request = $this->findEnrollmentRequest($requestId);
        if (!$request) {
            throw new RuntimeException('Enrollment request not found.');
        }

        $upload = $this->saveUpload('payment_slip', 'payment-slips', ['pdf', 'png', 'jpg', 'jpeg']);
        if (!$upload) {
            throw new RuntimeException('Upload a valid payment slip file.');
        }

        $this->db->execute(
            'UPDATE class_enrollment_requests
             SET payment_slip_name = :payment_slip_name, payment_slip_path = :payment_slip_path, status = "PAYMENT_SUBMITTED"
             WHERE id = :id',
            [
                'id' => $requestId,
                'payment_slip_name' => $upload['original_name'],
                'payment_slip_path' => $upload['relative_path'],
            ]
        );

        Flash::success('Payment slip uploaded. The teacher can review it now.');
        app_redirect('classes/enroll?class_id=' . urlencode((string) $request['class_id']) . '&request=' . urlencode($requestId));
    }

    private function reviewEnrollmentRequest(): void
    {
        $requestId = (string) app_input('request_id', '');
        $decision = (string) app_input('decision', 'REJECT');
        $reviewNote = trim((string) app_input('review_note', ''));
        $request = $this->findEnrollmentRequest($requestId);

        if (!$request) {
            Flash::error('Enrollment request not found.');
            return;
        }

        if ($decision === 'REJECT') {
            $this->db->execute(
                'UPDATE class_enrollment_requests SET status = "REJECTED", review_note = :review_note, reviewed_at = NOW() WHERE id = :id',
                ['id' => $requestId, 'review_note' => $reviewNote !== '' ? $reviewNote : null]
            );
            Flash::success('Enrollment request rejected.');
            return;
        }

        if ($request['status'] !== 'PAYMENT_SUBMITTED') {
            Flash::error('Payment slip must be uploaded before approval.');
            return;
        }

        $class = $this->findClass((string) $request['class_id']);
        if (!$class || $class['status'] !== 'ACTIVE') {
            Flash::error('Class is no longer active.');
            return;
        }

        $student = $this->db->fetch('SELECT * FROM students WHERE phone = :phone LIMIT 1', ['phone' => $request['student_phone']]);
        $studentId = $student['id'] ?? null;
        $tempPassword = $request['student_phone'];

        $this->db->transaction(function (SecureMySQL $db) use ($request, $requestId, $class, $studentId, $reviewNote, $tempPassword): void {
            $currentStudentId = $studentId;
            if ($currentStudentId === null) {
                $userId = \app_uuid();
                $currentStudentId = \app_uuid();
                $qrCode = 'LMS-' . strtoupper(str_replace(' ', '-', (string) $request['student_name'])) . '-' . substr(str_replace('-', '', \app_uuid()), 0, 8);

                $db->execute(
                    'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (:id, :name, :email, :phone, :password_hash, "STUDENT")',
                    [
                        'id' => $userId,
                        'name' => $request['student_name'],
                        'email' => $request['student_email'] ?: null,
                        'phone' => $request['student_phone'],
                        'password_hash' => password_hash($tempPassword, PASSWORD_DEFAULT),
                    ]
                );

                $db->execute(
                    'INSERT INTO students (id, name, phone, parent_name, parent_contact, grade, school, learning_level, notes, qr_code, user_id)
                     VALUES (:id, :name, :phone, :parent_name, :parent_contact, :grade, :school, :learning_level, :notes, :qr_code, :user_id)',
                    [
                        'id' => $currentStudentId,
                        'name' => $request['student_name'],
                        'phone' => $request['student_phone'],
                        'parent_name' => $request['parent_name'],
                        'parent_contact' => $request['parent_contact'] ?: null,
                        'grade' => $request['grade'] ?: null,
                        'school' => $request['school'] ?: null,
                        'learning_level' => $request['learning_level'] ?: null,
                        'notes' => $request['notes'] ?: null,
                        'qr_code' => $qrCode,
                        'user_id' => $userId,
                    ]
                );
            }

            $exists = $db->fetch(
                'SELECT id FROM class_enrollments WHERE class_id = :class_id AND student_id = :student_id LIMIT 1',
                ['class_id' => $class['id'], 'student_id' => $currentStudentId]
            );
            if (!$exists) {
                $db->execute(
                    'INSERT INTO class_enrollments (id, class_id, student_id) VALUES (:id, :class_id, :student_id)',
                    [
                        'id' => \app_uuid(),
                        'class_id' => $class['id'],
                        'student_id' => $currentStudentId,
                    ]
                );
            }

            $db->execute(
                'INSERT INTO payments (id, student_id, enrollment_request_id, amount, type, method, status, date)
                 VALUES (:id, :student_id, :enrollment_request_id, :amount, "CLASS", "ONLINE", "PAID", :date)
                 ON DUPLICATE KEY UPDATE status = "PAID", amount = VALUES(amount)',
                [
                    'id' => \app_uuid(),
                    'student_id' => $currentStudentId,
                    'enrollment_request_id' => $requestId,
                    'amount' => $class['fee'],
                    'date' => date('Y-m-d'),
                ]
            );

            $db->execute(
                'UPDATE class_enrollment_requests
                 SET status = "APPROVED", approved_student_id = :approved_student_id, review_note = :review_note, reviewed_at = NOW(), approved_at = NOW()
                 WHERE id = :id',
                [
                    'id' => $requestId,
                    'approved_student_id' => $currentStudentId,
                    'review_note' => $reviewNote !== '' ? $reviewNote : null,
                ]
            );
        });

        Flash::success('Enrollment request approved. Temporary student password is the phone number until changed.');
    }

    private function teacherProfile(): ?array
    {
        $teacher = $this->db->fetch(
            'SELECT id, name, email, phone FROM users WHERE role = "ADMIN" ORDER BY created_at ASC LIMIT 1'
        );
        if (!$teacher) {
            return null;
        }

        $summary = $this->db->fetch(
            'SELECT COUNT(*) AS active_class_count, COALESCE(SUM(enrolled_count), 0) AS total_students
             FROM (
                 SELECT c.id, COUNT(e.id) AS enrolled_count
                 FROM classes c
                 LEFT JOIN class_enrollments e ON e.class_id = c.id
                 WHERE c.teacher_id = :teacher_id AND c.status = "ACTIVE"
                 GROUP BY c.id
             ) summary',
            ['teacher_id' => $teacher['id']]
        );

        return array_merge($teacher, [
            'active_class_count' => (int) ($summary['active_class_count'] ?? 0),
            'total_students' => (int) ($summary['total_students'] ?? 0),
        ]);
    }

    private function publicClassList(): array
    {
        return $this->db->fetchAll(
            'SELECT c.*, u.name AS teacher_name, u.email AS teacher_email, u.phone AS teacher_phone, COUNT(e.id) AS seats_taken
             FROM classes c
             JOIN users u ON u.id = c.teacher_id
             LEFT JOIN class_enrollments e ON e.class_id = c.id
             WHERE c.status = "ACTIVE"
             GROUP BY c.id
             ORDER BY c.date ASC, c.start_time ASC'
        );
    }

    private function studentProfile(string $studentId): ?array
    {
        if ($studentId === '') {
            return null;
        }

        $student = $this->db->fetch(
            'SELECT s.*, u.email, u.name AS account_name
             FROM students s
             JOIN users u ON u.id = s.user_id
             WHERE s.id = :id
             LIMIT 1',
            ['id' => $studentId]
        );

        if (!$student) {
            return null;
        }

        $student['attendance'] = $this->db->fetchAll(
            'SELECT * FROM attendances WHERE student_id = :student_id ORDER BY date DESC LIMIT 12',
            ['student_id' => $studentId]
        );
        $student['payments'] = $this->db->fetchAll(
            'SELECT * FROM payments WHERE student_id = :student_id ORDER BY date DESC LIMIT 12',
            ['student_id' => $studentId]
        );
        $student['classes'] = $this->db->fetchAll(
            'SELECT c.*, u.name AS teacher_name
             FROM class_enrollments e
             JOIN classes c ON c.id = e.class_id
             JOIN users u ON u.id = c.teacher_id
             WHERE e.student_id = :student_id
             ORDER BY c.date ASC',
            ['student_id' => $studentId]
        );
        $student['results'] = $this->db->fetchAll(
            'SELECT r.*, q.title AS quiz_title
             FROM results r
             JOIN quizzes q ON q.id = r.quiz_id
             WHERE r.student_id = :student_id
             ORDER BY r.submitted_at DESC
             LIMIT 8',
            ['student_id' => $studentId]
        );
        $student['homework'] = $this->db->fetchAll(
            'SELECT hs.*, h.title AS homework_title, c.title AS class_title
             FROM homework_submissions hs
             JOIN homework h ON h.id = hs.homework_id
             JOIN classes c ON c.id = h.class_id
             WHERE hs.student_id = :student_id
             ORDER BY hs.updated_at DESC
             LIMIT 8',
            ['student_id' => $studentId]
        );

        return $student;
    }

    private function findClass(string $classId): ?array
    {
        return $this->db->fetch('SELECT * FROM classes WHERE id = :id LIMIT 1', ['id' => $classId]);
    }

    private function findEnrollmentRequest(string $requestId): ?array
    {
        return $this->db->fetch(
            'SELECT r.*, c.title AS class_title, c.fee, c.status AS class_status
             FROM class_enrollment_requests r
             JOIN classes c ON c.id = r.class_id
             WHERE r.id = :id
             LIMIT 1',
            ['id' => $requestId]
        );
    }

    private function findQuizWithQuestions(string $quizId): ?array
    {
        $quiz = $this->db->fetch('SELECT * FROM quizzes WHERE id = :id LIMIT 1', ['id' => $quizId]);
        if (!$quiz) {
            return null;
        }
        $questions = $this->db->fetchAll('SELECT * FROM questions WHERE quiz_id = :quiz_id ORDER BY created_at ASC', ['quiz_id' => $quizId]);
        foreach ($questions as &$question) {
            $question['options'] = json_decode((string) $question['options_json'], true) ?: [];
        }
        $quiz['questions'] = $questions;

        return $quiz;
    }

    private function requireAuth(): void
    {
        if (!$this->auth->check()) {
            app_redirect('login');
        }
    }

    private function verifyCsrf(): void
    {
        Csrf::validate(isset($_POST['_token']) ? (string) $_POST['_token'] : null);
    }

    private function render(string $view, array $data = []): void
    {
        $viewFile = dirname(__DIR__) . '/Views/' . $view;
        $title = $data['title'] ?? 'Apoorwa LMS PHP';
        $user = $this->auth->user();
        $flashMessages = Flash::messages();

        extract($data, EXTR_SKIP);

        require dirname(__DIR__) . '/Views/layouts/main.php';
    }

    private function saveUpload(string $field, string $folder, array $extensions): ?array
    {
        if (!isset($_FILES[$field]) || (int) $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $file = $_FILES[$field];
        $originalName = (string) $file['name'];
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        if (!in_array($extension, $extensions, true)) {
            throw new RuntimeException('The uploaded file type is not allowed.');
        }

        $safeName = time() . '-' . bin2hex(random_bytes(8)) . '.' . $extension;
        $relativePath = 'uploads/' . trim($folder, '/') . '/' . $safeName;
        $target = \app_storage_path($relativePath);
        $directory = dirname($target);

        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        if (!move_uploaded_file((string) $file['tmp_name'], $target)) {
            throw new RuntimeException('The uploaded file could not be saved.');
        }

        return [
            'original_name' => $originalName,
            'relative_path' => $relativePath,
        ];
    }

    private function upsertAttendance(string $studentId, string $date, string $status): void
    {
        $existing = $this->db->fetch(
            'SELECT id FROM attendances WHERE student_id = :student_id AND date = :date LIMIT 1',
            ['student_id' => $studentId, 'date' => $date]
        );

        if ($existing) {
            $this->db->execute(
                'UPDATE attendances SET status = :status WHERE id = :id',
                ['id' => $existing['id'], 'status' => $status]
            );
            return;
        }

        $this->db->execute(
            'INSERT INTO attendances (id, student_id, date, status) VALUES (:id, :student_id, :date, :status)',
            ['id' => \app_uuid(), 'student_id' => $studentId, 'date' => $date, 'status' => $status]
        );
    }

    private function download(string $relativePath): void
    {
        $this->requireAuth();

        $clean = ltrim(str_replace(['..', '\\'], ['', '/'], $relativePath), '/');
        $full = \app_storage_path($clean);

        if (!is_file($full)) {
            http_response_code(404);
            echo 'File not found.';
            return;
        }

        header('Content-Type: application/octet-stream');
        header('Content-Length: ' . (string) filesize($full));
        header('Content-Disposition: attachment; filename="' . basename($full) . '"');
        readfile($full);
        exit;
    }
}
