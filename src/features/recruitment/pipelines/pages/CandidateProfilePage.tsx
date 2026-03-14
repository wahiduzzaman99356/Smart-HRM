import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button, Tabs, Select, Rate, Input } from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BankOutlined,
  ReadOutlined,
  LinkedinOutlined,
  GithubOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  RightOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkExperience {
  title:       string;
  company:     string;
  from:        string;
  to:          string;
  description: string;
}

interface Education {
  degree:     string;
  university: string;
  from:       string;
  to:         string;
  gpa:        string;
}

interface PipelineStageResult {
  label: string;
  score: number;
  type:  'pass' | 'very-good' | 'fail';
}

interface PipelineStageEntry {
  id:        string;
  name:      string;
  order:     number;
  estDays:   number;
  modules:   number;
  result:    PipelineStageResult | null;
  isCurrent?: boolean;
}

interface QAEntry {
  q: string;
  a: string;
}

interface CandidateDetail {
  id:              string;
  name:            string;
  initials:        string;
  avatarColor:     string;
  status:          string;
  email:           string;
  phone:           string;
  source:          string;
  appliedAt:       string;
  experience:      number;
  degree:          string;
  previousCompany: string;
  rating:          number;
  dob:             string;
  gender:          string;
  nationality:     string;
  address:         string;
  workExperience:  WorkExperience[];
  education:       Education[];
  skills:          string[];
  linkedin:        string;
  github:          string;
  matchScore:      number;
  matchedSkills:   string[];
  currentStage:    string;
  tags:            string[];
  assessmentStatus: string;
  pipelineStages:  PipelineStageEntry[];
  jobQA:           QAEntry[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DETAIL: Record<string, CandidateDetail> = {
  '1': {
    id: '1', name: 'Sarah Jenkins', initials: 'SJ', avatarColor: '#7c3aed',
    status: 'Active', email: 'sarahj@email.com', phone: '+1 555-0101',
    source: 'LinkedIn', appliedAt: '2/9/2026', experience: 6, degree: 'B.Des',
    previousCompany: 'ex-Spotify', rating: 5,
    dob: '1994-03-15', gender: 'Female', nationality: 'American',
    address: '123 Main St, San Francisco, CA 94102',
    workExperience: [
      { title: 'Senior UX Designer', company: 'Spotify', from: '2022-01', to: '2026-01', description: 'Led design system overhaul' },
      { title: 'Product Designer',   company: 'Figma',   from: '2020-06', to: '2021-12', description: '' },
    ],
    education: [
      { degree: 'B.Des in Visual Communication', university: 'Stanford University', from: '2012', to: '2016', gpa: '3.8 GPA' },
    ],
    skills: ['Figma', 'SaaS', 'React', 'UX Design'],
    linkedin: 'linkedin.com/in/sarahjenkins', github: 'github.com/sarahj',
    matchScore: 95, matchedSkills: ['Figma', 'SaaS'], currentStage: 'Sourcing',
    tags: ['senior', 'react', 'figma'], assessmentStatus: 'Pending',
    pipelineStages: [
      { id: '1', name: 'Sourcing',          order: 1, estDays: 2, modules: 2, isCurrent: true, result: { label: 'Pass (80%)',        score: 80, type: 'pass'      } },
      { id: '2', name: 'Initial Meeting',   order: 2, estDays: 2, modules: 1, result: { label: 'Very Good (85%)',  score: 85, type: 'very-good' } },
      { id: '3', name: 'Panel Interview',   order: 3, estDays: 2, modules: 2, result: { label: 'Pass (76%)',        score: 76, type: 'pass'      } },
      { id: '4', name: 'Background Check',  order: 4, estDays: 2, modules: 1, result: { label: 'Failed (65%)',      score: 65, type: 'fail'      } },
      { id: '5', name: 'Board Approval',    order: 5, estDays: 2, modules: 1, result: null },
      { id: '6', name: 'Offer Accepted',    order: 6, estDays: 2, modules: 2, result: null },
    ],
    jobQA: [
      { q: 'Why do you want this job?',             a: 'This opportunity perfectly matches my skills and allows me to grow while contributing positively to the company.' },
      { q: 'What are your strengths?',              a: 'I am detail-oriented, a quick learner and possess strong communication skills.' },
      { q: 'Do you have any experience in this field?', a: 'Yes, I have relevant experience and I am eager to expand my knowledge further.' },
      { q: 'How do you handle stressful situations?', a: 'I stay calm, organized, and focus on finding effective solutions.' },
      { q: 'Do you like working alone or in a team?', a: 'I am comfortable with both, but enjoy teamwork and collaboration.' },
      { q: 'Why should we hire you?',               a: 'I am motivated, skilled, and dedicated to giving my best every single day.' },
    ],
  },
  '2': {
    id: '2', name: 'Emily Watson', initials: 'EW', avatarColor: '#0284c7',
    status: 'Active', email: 'emily.w@email.com', phone: '+1 555-0202',
    source: 'Referral', appliedAt: '2/6/2026', experience: 4, degree: 'B.Des',
    previousCompany: 'Agency', rating: 4,
    dob: '1996-07-22', gender: 'Female', nationality: 'Canadian',
    address: '456 Oak Ave, New York, NY 10001',
    workExperience: [
      { title: 'UI/UX Designer', company: 'Agency', from: '2020-03', to: '2026-01', description: 'Redesigned client-facing dashboards' },
    ],
    education: [
      { degree: 'B.Des in Interaction Design', university: 'OCAD University', from: '2014', to: '2018', gpa: '3.6 GPA' },
    ],
    skills: ['React', 'TypeScript', 'Figma', 'CSS'],
    linkedin: 'linkedin.com/in/emilywatson', github: 'github.com/emilyw',
    matchScore: 91, matchedSkills: ['React', 'TypeScript'], currentStage: 'Culture Fit',
    tags: ['react', 'typescript'], assessmentStatus: 'Completed',
    pipelineStages: [
      { id: '1', name: 'Sourcing',          order: 1, estDays: 2, modules: 2, result: { label: 'Pass (90%)',  score: 90, type: 'very-good' } },
      { id: '2', name: 'Initial Meeting',   order: 2, estDays: 2, modules: 1, result: { label: 'Pass (88%)',  score: 88, type: 'pass'      } },
      { id: '3', name: 'Panel Interview',   order: 3, estDays: 2, modules: 2, isCurrent: true, result: null },
      { id: '4', name: 'Background Check',  order: 4, estDays: 2, modules: 1, result: null },
      { id: '5', name: 'Board Approval',    order: 5, estDays: 2, modules: 1, result: null },
      { id: '6', name: 'Offer Accepted',    order: 6, estDays: 2, modules: 2, result: null },
    ],
    jobQA: [
      { q: 'Why do you want this job?',  a: 'I am excited about the creative challenges and growth potential this role offers.' },
      { q: 'What are your strengths?',   a: 'Strong technical skills in React combined with a keen eye for design consistency.' },
    ],
  },
};

function getCandidateDetail(candidateId: string): CandidateDetail {
  return MOCK_DETAIL[candidateId] ?? MOCK_DETAIL['1'];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'Active',    label: 'Active'    },
  { value: 'On Hold',   label: 'On Hold'   },
  { value: 'Hired',     label: 'Hired'     },
  { value: 'Rejected',  label: 'Rejected'  },
];

const PIPELINE_STAGE_OPTIONS = [
  { value: 'Sourcing',            label: 'Sourcing'            },
  { value: 'Initial Meeting',     label: 'Initial Meeting'     },
  { value: 'Panel Interview',     label: 'Panel Interview'     },
  { value: 'Background Check',    label: 'Background Check'    },
  { value: 'Board Approval',      label: 'Board Approval'      },
  { value: 'Offer Accepted',      label: 'Offer Accepted'      },
];

function resultBadge(result: PipelineStageResult) {
  const isFail = result.type === 'fail';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
      background: isFail ? '#fef2f2' : '#eef8f7',
      color:      isFail ? '#dc2626' : '#0f766e',
      border:     `1px solid ${isFail ? '#fca5a5' : '#99e6de'}`,
    }}>
      {isFail
        ? <CloseCircleOutlined style={{ fontSize: 11 }} />
        : <CheckCircleOutlined style={{ fontSize: 11 }} />}
      {result.label}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '18px 20px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 16 }}>
        {number}. {title}
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ c }: { c: CandidateDetail }) {
  const gridTwo: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px',
  };
  const gridThree: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 24px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* 1. Personal Information */}
      <Section number={1} title="Personal Information">
        <div style={gridThree}>
          <Field label="Full Name"     value={c.name} />
          <Field label="Email"         value={c.email} />
          <Field label="Phone"         value={c.phone} />
          <Field label="Date of Birth" value={c.dob} />
          <Field label="Gender"        value={c.gender} />
          <Field label="Nationality"   value={c.nationality} />
        </div>
      </Section>

      {/* 2. Address Details */}
      <Section number={2} title="Address Details">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <EnvironmentOutlined style={{ color: '#94a3b8', marginTop: 2, fontSize: 13 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Current Address
            </span>
            <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{c.address}</span>
          </div>
        </div>
      </Section>

      {/* 3. Work Experience */}
      <Section number={3} title="Work Experience">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {c.workExperience.map((exp, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '12px 14px',
              background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BankOutlined style={{ color: '#64748b', fontSize: 16 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{exp.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{exp.company}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {exp.from} — {exp.to}
                </div>
                {exp.description && (
                  <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>{exp.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Education & Skills */}
      <Section number={4} title="Education & Skills">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {c.education.map((edu, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '12px 14px',
              background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ReadOutlined style={{ color: '#64748b', fontSize: 16 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{edu.degree}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{edu.university}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {edu.from} — {edu.to}
                </div>
                {edu.gpa && (
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    background: '#f0fdf4', color: '#15803d',
                    border: '1px solid #86efac', borderRadius: 4,
                  }}>
                    {edu.gpa}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.skills.map(skill => (
                <span key={skill} style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
                  background: '#f0fdfa', color: '#0f766e', border: '1px solid #99e6de',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Other Information */}
      <Section number={5} title="Other Information">
        <div style={gridTwo}>
          <Field label="Source"           value={c.source} />
          <Field label="Previous Company" value={c.previousCompany} />
          <Field label="Applied At"       value={c.appliedAt} />
          <Field label="Experience"       value={`${c.experience} years`} />
        </div>
      </Section>

      {/* 6. Social Links */}
      <Section number={6} title="Social Links">
        <div style={gridTwo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LinkedinOutlined style={{ color: '#0284c7', fontSize: 16 }} />
            <a href={`https://${c.linkedin}`} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: '#0f766e', textDecoration: 'none', fontWeight: 500 }}>
              {c.linkedin}
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GithubOutlined style={{ color: '#374151', fontSize: 16 }} />
            <a href={`https://${c.github}`} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: '#0f766e', textDecoration: 'none', fontWeight: 500 }}>
              {c.github}
            </a>
          </div>
        </div>
      </Section>

      {/* 7. AI Match Analysis */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: 10, padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <InfoCircleOutlined style={{ color: '#0f766e', fontSize: 14 }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>AI Match Analysis</span>
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{c.matchScore}%</span>
          <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>match score</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: '#d1fae5', overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${c.matchScore}%`, background: '#059669', borderRadius: 4 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
            Matching Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.matchedSkills.map(skill => (
              <span key={skill} style={{
                fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
                background: '#f0fdfa', color: '#0f766e', border: '1px solid #99e6de',
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Documents */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: 10, padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <FileTextOutlined style={{ color: '#6b7280', fontSize: 14 }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Documents</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: '#f8fafc',
          borderRadius: 8, border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileTextOutlined style={{ color: '#64748b', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>Resume / CV</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Uploaded on {c.appliedAt}</div>
            </div>
          </div>
          <Button size="small" style={{ fontSize: 12, fontWeight: 600 }}>View</Button>
        </div>
      </div>

    </div>
  );
}

// ─── Pipeline Progress Tab ────────────────────────────────────────────────────
function PipelineProgressTab({ c }: { c: CandidateDetail }) {
  const currentIdx = c.pipelineStages.findIndex(s => s.isCurrent);
  const total      = c.pipelineStages.length;
  const progress   = currentIdx >= 0 ? Math.round(((currentIdx + 1) / total) * 100) : 0;

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '20px 22px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>
        Pipeline Progress
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
          Stage {currentIdx >= 0 ? currentIdx + 1 : '?'} of {total}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>Result</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#0f766e', borderRadius: 3, transition: 'width 0.3s' }} />
      </div>

      {/* Stage rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {c.pipelineStages.map((stage, idx) => {
          const isCurrent  = !!stage.isCurrent;
          const isPast     = currentIdx >= 0 && idx < currentIdx;
          const isUpcoming = !isCurrent && !isPast;

          return (
            <div key={stage.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '12px 0',
              borderBottom: idx < total - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              {/* Circle + connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                  background: isCurrent ? '#0f766e' : isPast ? '#d4efeb' : '#f1f5f9',
                  color:      isCurrent ? '#ffffff' : isPast ? '#0f766e' : '#94a3b8',
                  border:     isCurrent ? '2px solid #0f766e' : isPast ? '2px solid #99e6de' : '2px solid #e2e8f0',
                }}>
                  {stage.order}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: isCurrent ? '#0f766e' : isUpcoming ? '#9ca3af' : '#111827' }}>
                  {stage.name}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  Est. {stage.estDays} days · {stage.modules} module{stage.modules !== 1 ? 's' : ''}
                </div>
                {isCurrent && (
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: '#0f766e', color: '#ffffff',
                  }}>
                    Current Stage
                  </span>
                )}
              </div>

              {/* Result */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', minHeight: 30 }}>
                {stage.result ? resultBadge(stage.result) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────
function NotesTab() {
  const [notes, setNotes] = useState('');
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '20px 22px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 14 }}>Notes</div>
      <Input.TextArea
        placeholder="Add notes about this candidate..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={10}
        style={{ resize: 'vertical', fontSize: 13, borderRadius: 8 }}
      />
    </div>
  );
}

// ─── Job Q&A Tab ──────────────────────────────────────────────────────────────
function JobQATab({ c }: { c: CandidateDetail }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
        <MessageOutlined style={{ color: '#6b7280', fontSize: 14 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Job Q&amp;A</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {c.jobQA.map((qa, i) => (
          <div key={i}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 5 }}>
              Q{i + 1}. {qa.q}
            </div>
            <div style={{ fontSize: 13, color: '#0f766e', lineHeight: 1.6 }}>
              A. {qa.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface LocationState {
  pipelineName?: string;
  position?:     string;
}

export default function CandidateProfilePage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { id, candidateId } = useParams<{ id: string; candidateId: string }>();
  const state         = (location.state ?? {}) as LocationState;

  const pipelineName = state.pipelineName ?? 'Pipeline';
  const c            = getCandidateDetail(candidateId ?? '1');

  const [activeTab, setActiveTab] = useState('overview');
  const [stage,     setStage]     = useState(c.currentStage);
  const [status,    setStatus]    = useState(c.status);

  function handleBack() {
    navigate(-1);
  }

  const tabItems = [
    { key: 'overview',  label: 'Overview',          children: <OverviewTab c={c} /> },
    { key: 'pipeline',  label: 'Pipeline Progress',  children: <PipelineProgressTab c={c} /> },
    { key: 'notes',     label: 'Notes',              children: <NotesTab /> },
    { key: 'jobqa',     label: 'Job Q&A',            children: <JobQATab c={c} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '0 20px', height: 52,
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ color: '#6b7280', padding: '0 6px', height: 28, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1, marginBottom: 3 }}>
            <span
              onClick={() => navigate(-1)}
              style={{ cursor: 'pointer', color: '#6b7280', transition: 'color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#0f766e')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#6b7280')}
            >
              {pipelineName}
            </span>
            <span style={{ margin: '0 5px', color: '#cbd5e1' }}>›</span>
            <span>Candidates</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', lineHeight: 1 }}>
            {c.name}
          </div>
        </div>

        <Button
          danger
          icon={<DeleteOutlined />}
          size="small"
          style={{ fontSize: 12, height: 30, paddingInline: 14, fontWeight: 600 }}
        >
          Remove
        </Button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* Profile header card */}
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '20px 24px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: c.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em',
              boxShadow: `0 0 0 3px ${c.avatarColor}33`,
            }}>
              {c.initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{c.name}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac',
                }}>
                  {c.status}
                </span>
              </div>

              {/* Contact row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 16px', marginBottom: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                  <MailOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> {c.email}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                  <PhoneOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> {c.phone}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                  <EnvironmentOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> Source: {c.source}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                  <CalendarOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> Applied {c.appliedAt}
                </span>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 16px', marginBottom: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                  <BankOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> {c.experience} years exp.
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                  <ReadOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> {c.degree}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  Previously at <strong style={{ color: '#111827' }}>{c.previousCompany}</strong>
                </span>
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Rate disabled defaultValue={c.rating} style={{ fontSize: 16 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{c.rating}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* ── Left: Tabs ────────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="small"
              style={{ background: 'transparent' }}
            />
          </div>

          {/* ── Right: Sidebar ────────────────────────────────────────────── */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 0 }}>

            {/* Quick Actions */}
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '16px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 14 }}>
                Quick Actions
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                  Move to Stage
                </div>
                <Select
                  value={stage}
                  onChange={v => setStage(v)}
                  options={PIPELINE_STAGE_OPTIONS}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                  Status
                </div>
                <Select
                  value={status}
                  onChange={v => setStatus(v)}
                  options={STATUS_OPTIONS}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>

              <Button
                type="primary"
                icon={<RightOutlined />}
                block
                style={{ fontWeight: 700, fontSize: 12 }}
              >
                Advance to Next Stage
              </Button>
            </div>

            {/* Tags */}
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '16px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <TagsOutlined style={{ color: '#6b7280', fontSize: 13 }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Tags</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                    background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Assessment Status */}
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '16px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 12 }}>
                Assessment Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <ClockCircleOutlined style={{
                  fontSize: 14,
                  color: c.assessmentStatus === 'Completed' ? '#059669' : '#d97706',
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: c.assessmentStatus === 'Completed' ? '#059669' : '#d97706',
                }}>
                  {c.assessmentStatus}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
