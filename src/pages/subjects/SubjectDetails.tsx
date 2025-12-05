import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
    useGetSubjectsQuery,
    useGetClassesQuery,
    useGetTeachersQuery,
    useAssignTeacherToSubjectMutation,
} from '@/services/authApi';
import { ArrowLeft, BookOpen, Users, User, Plus, Loader2 } from 'lucide-react';
import './Subjects.css'; // Reuse CSS

export default function SubjectDetails() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    // List Find Pattern: Fetch subjects list and find the detail
    const { data: subjects = [], isLoading: loadingSubjects } =
        useGetSubjectsQuery(user?.schoolId || '', { skip: !user?.schoolId });
    const subjectData = subjects.find((s) => s.id === subjectId);

    // Data needed for assignment form
    const { data: classes = [] } = useGetClassesQuery(user?.schoolId || '', {
        skip: !user?.schoolId,
    });
    const { data: teachers = [] } = useGetTeachersQuery(user?.schoolId || '', {
        skip: !user?.schoolId,
    });

    // Mutation hook
    const [assignTeacher, { isLoading: assigning }] =
        useAssignTeacherToSubjectMutation();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);

    // --- Handlers ---

    const handleAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectId || !selectedClassId || !selectedTeacherId) return;

        try {
            await assignTeacher({
                subjectId,
                classId: selectedClassId,
                teacherProfileId: selectedTeacherId,
            }).unwrap();

            setSelectedClassId('');
            setSelectedTeacherId('');
            setShowAssignmentForm(false);
            // Replaced alert with console.log as per rules
            console.log('Teacher successfully assigned!');
        } catch (error) {
            console.error('Failed to assign teacher:', error);
            // Replaced alert with console.error as per rules
            console.error('Assignment failed.');
        }
    };

    const availableTeachers = useMemo(() => {
        return teachers.map((t) => ({ id: t.profileId, name: t.name }));
    }, [teachers]);

    if (loadingSubjects) {
        return (
            <div className='subjects-container detail-view'>
                <div className='loading-container'>
                    <Loader2 className='spinner' size={40} />
                </div>
            </div>
        );
    }

    if (!subjectData) {
        return (
            <div className='subjects-container detail-view'>
                <button
                    onClick={() => navigate('/dashboard/subjects')}
                    className='back-button'>
                    <ArrowLeft size={20} /> Back to Subjects
                </button>
                <div className='empty-state'>
                    <BookOpen className='empty-icon' size={48} />
                    <h3 className='empty-title'>Subject not found</h3>
                    <p className='empty-description'>
                        The requested subject details could not be loaded.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='subjects-container detail-view'>
            <button
                onClick={() => navigate('/dashboard/subjects')}
                className='back-button'>
                <ArrowLeft size={20} /> Back to Subjects
            </button>

            <div className='details-card'>
                <div className='detail-header'>
                    <div className='detail-avatar subject'>
                        <BookOpen size={40} />
                    </div>
                    <div className='detail-info'>
                        <h1 className='detail-name'>{subjectData.name}</h1>
                        <p className='detail-role'>
                            {subjectData.description || 'Academic Subject'}
                        </p>
                    </div>
                </div>

                {/* --- Subject Overview --- */}
                <div className='detail-section'>
                    <h2 className='section-title'>Overview</h2>
                    <div className='detail-grid'>
                        <div className='detail-item'>
                            <div className='detail-icon'>
                                <Users size={20} />
                            </div>
                            <div>
                                <p className='detail-label'>Classes Taught In</p>
                                <p className='detail-value'>{subjectData.totalClassesTaught}</p>
                            </div>
                        </div>
                        <div className='detail-item'>
                            <div className='detail-icon'>
                                <User size={20} />
                            </div>
                            <div>
                                <p className='detail-label'>Teachers Assigned</p>
                                <p className='detail-value'>
                                    {subjectData.totalTeachersAssigned}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Teacher Assignment Section --- */}
                <div className='detail-section assignment-section'>
                    <div className='assignment-header'>
                        <h2 className='section-title'>Assign Teacher to Class</h2>
                        <button
                            className='icon-button-large assign'
                            onClick={() => setShowAssignmentForm(!showAssignmentForm)}>
                            <Plus size={20} />
                            {showAssignmentForm ? 'Hide Form' : 'New Assignment'}
                        </button>
                    </div>

                    {showAssignmentForm && (
                        <form onSubmit={handleAssignment} className='assignment-form'>
                            <div className='form-group'>
                                <label className='form-label'>Select Class</label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className='form-select'
                                    required>
                                    <option value=''>-- Select Class --</option>
                                    {/* Displaying grade level of the class for context */}
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} (Grade {cls.gradeLevel})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='form-group'>
                                <label className='form-label'>Select Teacher</label>
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    className='form-select'
                                    required>
                                    <option value=''>-- Select Teacher --</option>
                                    {availableTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type='submit'
                                disabled={assigning}
                                className='form-submit-button'>
                                {assigning ? (
                                    <Loader2 className='spinner' size={20} />
                                ) : (
                                    'Assign Teacher'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* --- Classes and Teachers Listing --- */}
                <div className='detail-section'>
                    <h2 className='section-title'>Assignments by Class</h2>
                    <div className='assignments-list'>
                        {subjectData.classes && subjectData.classes.length > 0 ? (
                            subjectData.classes.map((assignment) => (
                                <div key={assignment.classId} className='assignment-item'>
                                    <div className='assignment-class'>
                                        <BookOpen size={16} />
                                        <span>{assignment.className}</span>
                                    </div>
                                    <div className='assignment-teachers'>
                                        {assignment.teachers.length > 0 ? (
                                            assignment.teachers.map((t) => (
                                                <span key={t.userId} className='teacher-chip'>
                                                    {t.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className='teacher-chip unassigned'>
                                                Unassigned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className='empty-description'>
                                This subject is not currently assigned to any class.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}