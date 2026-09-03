'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, LayoutDashboard, Settings, Bell, FolderKanban, Pencil, Trash2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { faNum } from '@/lib/dates';
import type { Project, Task, TaskPriority, TaskStatus } from '@/types';

const seedProjects = [
  'الیت هوم','ادیامور','پلاتو برگر','استارویچ','عباس زاده',
  'NexMad','سایت نظری','سایت الیت','سایت امینکو','اپ الیت'
];

type View = 'dashboard'|'projects'|'calendar'|'notifications'|'settings';

type TaskDraft = {
  title:string; description:string; status:TaskStatus; priority:TaskPriority;
  do_date:string; deadline:string;
};

const emptyTask:TaskDraft = {
  title:'', description:'', status:'انجام نشده', priority:'عادی', do_date:'', deadline:''
};

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [view,setView] = useState<View>('dashboard');
  const [projects,setProjects] = useState<Project[]>([]);
  const [tasks,setTasks] = useState<Task[]>([]);
  const [taskModal,setTaskModal] = useState<{projectId:string; task?:Task}|null>(null);
  const [taskDraft,setTaskDraft] = useState<TaskDraft>(emptyTask);
  const [projectModal,setProjectModal] = useState(false);
  const [projectName,setProjectName] = useState('');
  const [loading,setLoading] = useState(true);
  const [userEmail,setUserEmail] = useState<string|null>(null);
  const [loginEmail,setLoginEmail] = useState('');
  const [loginPassword,setLoginPassword] = useState('');
  const [authError,setAuthError] = useState('');

  useEffect(()=>{ loadData(); },[]);

  async function loadData(){
    if(!supabase){
      const raw=localStorage.getItem('milich-pm-fallback');
      if(raw){
        const parsed=JSON.parse(raw);
        setProjects(parsed.projects||[]);
        setTasks(parsed.tasks||[]);
      } else {
        const now=Date.now();
        setProjects(seedProjects.map((name,i)=>({id:`local-${now}-${i}`,name,sort_order:i,is_archived:false})));
        setTasks([]);
      }
      setLoading(false); return;
    }

    const {data:{session}} = await supabase.auth.getSession();
    if(!session?.user){
      setUserEmail(null);
      setLoading(false);
      return;
    }
    setUserEmail(session.user.email||'user');

    let {data:p} = await supabase.from('projects').select('*').eq('is_archived',false).order('sort_order');
    if(!p?.length){
      await supabase.from('projects').insert(seedProjects.map((name,i)=>({name,sort_order:i,is_archived:false})));
      const again=await supabase.from('projects').select('*').eq('is_archived',false).order('sort_order');
      p=again.data;
    }
    const {data:t} = await supabase.from('tasks').select('*').order('created_at');
    setProjects((p||[]) as Project[]);
    setTasks((t||[]) as Task[]);
    setLoading(false);
  }

  async function login(){
    if(!supabase)return;
    setAuthError('');
    const {error}=await supabase.auth.signInWithPassword({email:loginEmail.trim(),password:loginPassword});
    if(error){setAuthError(error.message);return}
    setLoading(true);
    await loadData();
  }

  async function logout(){
    if(!supabase)return;
    await supabase.auth.signOut();
    setUserEmail(null);setProjects([]);setTasks([]);
  }

  useEffect(()=>{
    if(!loading && !supabase){
      localStorage.setItem('milich-pm-fallback',JSON.stringify({projects,tasks}));
    }
  },[projects,tasks,loading,supabase]);

  const openTasks=tasks.filter(t=>!['انجام شده','کنسل شده'].includes(t.status));
  const doneTasks=tasks.filter(t=>t.status==='انجام شده');
  const urgent=openTasks.filter(t=>t.priority==='فوری');

  async function createProject(){
    const name=projectName.trim(); if(!name)return;
    if(supabase){
      const {data}=await supabase.from('projects').insert({name,sort_order:projects.length,is_archived:false}).select().single();
      if(data)setProjects(v=>[...v,data as Project]);
    } else {
      setProjects(v=>[...v,{id:crypto.randomUUID(),name,sort_order:v.length,is_archived:false}]);
    }
    setProjectName('');setProjectModal(false);
  }

  function openNewTask(projectId:string){ setTaskDraft(emptyTask); setTaskModal({projectId}); }
  function openEditTask(task:Task){
    setTaskDraft({
      title:task.title,description:task.description||'',status:task.status,priority:task.priority,
      do_date:task.do_date||'',deadline:task.deadline||''
    });
    setTaskModal({projectId:task.project_id,task});
  }

  async function saveTask(){
    if(!taskModal || !taskDraft.title.trim())return;
    const payload={
      project_id:taskModal.projectId,title:taskDraft.title.trim(),
      description:taskDraft.description||null,status:taskDraft.status,priority:taskDraft.priority,
      do_date:taskDraft.do_date||null,deadline:taskDraft.deadline||null
    };
    if(taskModal.task){
      if(supabase){
        const {data}=await supabase.from('tasks').update(payload).eq('id',taskModal.task.id).select().single();
        if(data)setTasks(v=>v.map(t=>t.id===taskModal.task!.id?data as Task:t));
      }else{
        setTasks(v=>v.map(t=>t.id===taskModal.task!.id?{...t,...payload,updated_at:new Date().toISOString()}:t));
      }
    }else{
      if(supabase){
        const {data}=await supabase.from('tasks').insert(payload).select().single();
        if(data)setTasks(v=>[...v,data as Task]);
      }else{
        const now=new Date().toISOString();
        setTasks(v=>[...v,{id:crypto.randomUUID(),...payload,created_at:now,updated_at:now} as Task]);
      }
    }
    setTaskModal(null);
  }

  async function deleteTask(task:Task){
    if(!confirm(`کار «${task.title}» حذف شود؟`))return;
    if(supabase)await supabase.from('tasks').delete().eq('id',task.id);
    setTasks(v=>v.filter(t=>t.id!==task.id));
    if(taskModal?.task?.id===task.id)setTaskModal(null);
  }

  const nav=[
    {id:'dashboard' as View,label:'داشبورد',icon:LayoutDashboard},
    {id:'projects' as View,label:'پروژه‌ها و کارها',icon:FolderKanban},
    {id:'calendar' as View,label:'تقویم',icon:CalendarDays},
    {id:'notifications' as View,label:'نوتیفیکیشن‌ها',icon:Bell},
    {id:'settings' as View,label:'تنظیمات',icon:Settings},
  ];

  if(loading)return <div style={{padding:30}}>در حال بارگذاری…</div>;

  if(supabase && !userEmail){
    return <div className="loginScreen">
      <div className="card loginCard">
        <div className="brand" style={{marginBottom:18}}><div className="brandMark">M</div><span>MILICH</span></div>
        <h2>ورود به مدیریت پروژه‌ها</h2>
        <p className="muted">فقط حساب کاربری خودت اجازه دسترسی به داده‌ها را دارد.</p>
        <div className="field" style={{marginTop:16}}><label>ایمیل</label><input value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} type="email"/></div>
        <div className="field" style={{marginTop:10}}><label>رمز عبور</label><input value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} type="password" onKeyDown={e=>{if(e.key==='Enter')login()}}/></div>
        {authError && <div className="authError">{authError}</div>}
        <button className="primary" style={{width:'100%',marginTop:14}} onClick={login}>ورود</button>
      </div>
    </div>
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">M</div><span>MILICH</span></div>
      <div className="nav">{nav.map(n=><button key={n.id} className={`navBtn ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}>
        <span className="navIcon"><n.icon size={17}/></span><span>{n.label}</span>
      </button>)}</div>
    </aside>

    <main className="content">
      {view==='dashboard' && <>
        <div className="topbar"><div><h1>داشبورد مدیریتی</h1><div className="muted">نمای سریع پروژه‌ها و کارهای Milich</div></div></div>
        <div className="card hero">
          <h2>{openTasks.length ? `${faNum(openTasks.length)} کار باز داری` : 'فعلاً کاری ثبت نشده'}</h2>
          <p>{openTasks.length ? 'کارهای فوری و نزدیک به ددلاین را در اولویت بگذار.' : 'پروژه‌ها آماده‌اند. از بخش پروژه‌ها اولین کار را اضافه کن.'}</p>
          <div className="pills"><span className="pill">{faNum(projects.length)} پروژه</span><span className="pill">{faNum(openTasks.length)} کار باز</span><span className="pill">{faNum(urgent.length)} فوری</span></div>
        </div>
        <div className="kpis">
          <div className="card kpi"><strong>{faNum(openTasks.length)}</strong><span>کار باز</span></div>
          <div className="card kpi"><strong>۰</strong><span>عقب‌افتاده</span></div>
          <div className="card kpi"><strong>۰</strong><span>کار امروز</span></div>
          <div className="card kpi"><strong>{faNum(urgent.length)}</strong><span>فوری</span></div>
          <div className="card kpi"><strong>{faNum(projects.length)}</strong><span>پروژه فعال</span></div>
          <div className="card kpi"><strong>{faNum(doneTasks.length)}</strong><span>انجام‌شده</span></div>
        </div>
        <div className="grid2">
          <div className="card sectionCard"><div className="sectionTitle">تمرکز امروز</div>{urgent.length?urgent.slice(0,5).map(t=><div className="mini" key={t.id}><span>{t.title}</span><small>{projects.find(p=>p.id===t.project_id)?.name}</small></div>):<div className="empty">کار فوری ثبت نشده.</div>}</div>
          <div className="card sectionCard"><div className="sectionTitle">هشدارها</div><div className="empty">هشدارهای زمان‌بندی پس از اتصال اعلان‌های سرور فعال می‌شوند.</div></div>
        </div>
      </>}

      {view==='projects' && <>
        <div className="toolbar"><div><h2>پروژه‌ها و کارها</h2><div className="muted">همه پروژه‌های فعلی Milich</div></div><button className="primary" onClick={()=>setProjectModal(true)}>+ پروژه جدید</button></div>
        <div className="boardWrap"><div className="board">{projects.map(p=>{
          const pts=tasks.filter(t=>t.project_id===p.id);
          return <div className="project" key={p.id}>
            <div className="projectHead"><strong>{p.name}</strong><small>{faNum(pts.length)} کار</small></div>
            <button className="addTask" onClick={()=>openNewTask(p.id)}><Plus size={13}/> افزودن کار</button>
            {!pts.length && <div className="empty">کاری ثبت نشده</div>}
            {pts.map(t=><div className="task" key={t.id} title={`تاریخ انجام: ${t.do_date||'—'} | ددلاین: ${t.deadline||'—'} | ${t.priority}`}>
              <span className="taskTitle" onClick={()=>openEditTask(t)}>{t.title}</span>
              <span className="taskActions">
                <button className="iconBtn" onClick={()=>openEditTask(t)} title="ویرایش"><Pencil size={12}/></button>
                <button className="iconBtn" onClick={()=>deleteTask(t)} title="حذف"><Trash2 size={12}/></button>
              </span>
            </div>)}
          </div>
        })}</div></div>
      </>}

      {view==='calendar' && <><div className="toolbar"><div><h2>تقویم</h2><div className="muted">نسخه پایه؛ اتصال کامل رویدادها در فاز اعلان‌ها</div></div></div><div className="card sectionCard"><div className="sectionTitle">تقویم شمسی</div><div className="empty">ساختار PWA آماده است. تقویم تعاملی و یادآوری سرور در مرحله بعد تکمیل می‌شود.</div></div></>}
      {view==='notifications' && <><div className="toolbar"><div><h2>نوتیفیکیشن‌ها</h2><div className="muted">هشدارهای موعد انجام و ددلاین</div></div></div><div className="card sectionCard"><div className="empty">Push Notification نیاز به Service Worker + زمان‌بندی سمت سرور دارد؛ زیرساخت پروژه برای اضافه‌شدن آن آماده است.</div></div></>}
      {view==='settings' && <><div className="toolbar"><div><h2>تنظیمات</h2><div className="muted">تنظیم ظاهر و رفتار اپ</div></div></div><div className="card sectionCard"><div className="sectionTitle">وضعیت اتصال</div><div className="mini"><span>دیتابیس</span><small>{supabase?'Supabase متصل':'حالت Local fallback'}</small></div><div className="mini"><span>PWA</span><small>فعال</small></div><div className="mini"><span>نسخه موبایل</span><small>Responsive + Bottom Navigation</small></div>{supabase&&<button className="danger" onClick={logout}>خروج از حساب</button>}</div></>}
    </main>

    <nav className="mobileNav">{nav.map(n=><button key={n.id} className={`mobileBtn ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}><n.icon/><span>{n.label}</span></button>)}</nav>

    {projectModal && <div className="modalBackdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setProjectModal(false)}}>
      <div className="modal"><div className="modalHeader"><div><h3>پروژه جدید</h3><div className="muted">نام پروژه را وارد کن</div></div><button className="close" onClick={()=>setProjectModal(false)}>×</button></div>
      <div className="formGrid"><div className="field full"><label>نام پروژه</label><input value={projectName} onChange={e=>setProjectName(e.target.value)} autoFocus/></div></div>
      <div className="modalActions"><button className="primary" onClick={createProject}>ساخت پروژه</button><button className="secondary" onClick={()=>setProjectModal(false)}>انصراف</button></div></div>
    </div>}

    {taskModal && <div className="modalBackdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setTaskModal(null)}}>
      <div className="modal"><div className="modalHeader"><div><h3>{taskModal.task?'ویرایش کار':'کار جدید'}</h3><div className="muted">{projects.find(p=>p.id===taskModal.projectId)?.name}</div></div><button className="close" onClick={()=>setTaskModal(null)}>×</button></div>
      <div className="formGrid">
        <div className="field full"><label>عنوان کار</label><input value={taskDraft.title} onChange={e=>setTaskDraft({...taskDraft,title:e.target.value})}/></div>
        <div className="field"><label>وضعیت</label><select value={taskDraft.status} onChange={e=>setTaskDraft({...taskDraft,status:e.target.value as TaskStatus})}><option>انجام نشده</option><option>در حال انجام</option><option>منتظر</option><option>انجام شده</option><option>کنسل شده</option></select></div>
        <div className="field"><label>اولویت</label><select value={taskDraft.priority} onChange={e=>setTaskDraft({...taskDraft,priority:e.target.value as TaskPriority})}><option>فوری</option><option>عادی</option><option>غیرمهم</option></select></div>
        <div className="field"><label>تاریخ انجام</label><input type="date" value={taskDraft.do_date} onChange={e=>setTaskDraft({...taskDraft,do_date:e.target.value})}/></div>
        <div className="field"><label>ددلاین</label><input type="date" value={taskDraft.deadline} onChange={e=>setTaskDraft({...taskDraft,deadline:e.target.value})}/></div>
        <div className="field full"><label>توضیحات</label><textarea value={taskDraft.description} onChange={e=>setTaskDraft({...taskDraft,description:e.target.value})}/></div>
      </div>
      <div className="modalActions"><button className="primary" onClick={saveTask}>ذخیره</button><button className="secondary" onClick={()=>setTaskModal(null)}>انصراف</button>{taskModal.task&&<button className="danger" onClick={()=>deleteTask(taskModal.task!)}>حذف</button>}</div></div>
    </div>}
  </div>
}
