import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function EntryDialog({title,onClose,error,children}:{title:string;onClose:()=>void;error:string;children:ReactNode}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  const before=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  ref.current?.querySelector<HTMLElement>('button')?.focus();
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape')onClose();
   if(event.key==='Tab'){
    const nodes=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')||[]);
    const first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);before?.focus();};
 },[onClose]);
 return <div className="modal-backdrop" onClick={onClose}><section ref={ref} className="modal entry-dialog" role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{error&&<div className="alert" role="alert">{error}</div>}{children}</section></div>;
}
