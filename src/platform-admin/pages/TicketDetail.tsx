import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, ExternalLink, MessageSquare, Send, Paperclip, Lock, ShieldAlert } from 'lucide-react';
import { supportTickets } from '../data';
import { Button } from '@/components/ui';

export function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  
  const ticket = supportTickets.find(t => t.id === id);
  if (!ticket) return <div className="text-white p-8">Ticket not found</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate('/platform-control/tickets')} className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 border rounded-full text-[11px] font-bold uppercase tracking-wider ${
              ticket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              'bg-[#2a2e37] text-neutral-300 border-neutral-600'
            }`}>
              {ticket.status}
            </span>
            <span className="text-sm font-mono text-neutral-500">{ticket.id}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white tracking-tight">{ticket.subject}</h1>
        </div>

        <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-4 flex flex-col gap-3 min-w-[250px]">
           <button onClick={() => navigate(`/platform-control/tenants/${ticket.tenantId}`)} className="flex items-center justify-between text-sm text-neutral-300 hover:text-white group">
             <div className="flex items-center gap-2">
               <User className="w-4 h-4 text-neutral-500" />
               <span className="font-medium group-hover:underline">{ticket.tenantName}</span>
             </div>
             <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
           </button>
           
           <div className="w-full h-px bg-[#2a2e37]"></div>
           
           <div className="flex justify-between text-xs">
             <span className="text-neutral-500 uppercase tracking-wider">Priority</span>
             <span className="font-semibold text-white">{ticket.priority}</span>
           </div>
           <div className="flex justify-between text-xs">
             <span className="text-neutral-500 uppercase tracking-wider">Category</span>
             <span className="font-semibold text-white">{ticket.category}</span>
           </div>
           
           {ticket.slaFirstResponseMins && (
             <>
               <div className="w-full h-px bg-[#2a2e37]"></div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-neutral-500 uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> SLA Target</span>
                 <span className="font-semibold text-amber-400">{ticket.slaFirstResponseMins} mins</span>
               </div>
             </>
           )}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl overflow-hidden flex flex-col h-[600px]">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {ticket.messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 ${msg.isInternal ? 'pl-8' : ''}`}>
               <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center font-bold text-sm shadow-sm ${
                 msg.isInternal ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                 msg.authorId === ticket.tenantId ? 'bg-[#2a2e37] text-neutral-300 border border-[#3a3e47]' : 
                 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
               }`}>
                 {msg.authorName.charAt(0)}
               </div>
               <div className="flex-1 space-y-1">
                 <div className="flex items-center gap-2">
                   <span className="font-medium text-white">{msg.authorName}</span>
                   <span className="text-xs text-neutral-500">{new Date(msg.timestamp).toLocaleString()}</span>
                   {msg.isInternal && (
                     <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 rounded-full border border-amber-500/20 ml-2">
                       <Lock className="w-3 h-3" /> Internal Note
                     </span>
                   )}
                 </div>
                 <div className={`text-sm p-4 rounded-xl rounded-tl-sm ${
                   msg.isInternal ? 'bg-amber-500/5 text-amber-100 border border-amber-500/20' : 'bg-[#2a2e37]/50 text-neutral-300'
                 }`}>
                   {msg.content.split('\n').map((line, i) => (
                     <p key={i} className="mb-2 last:mb-0">{line}</p>
                   ))}
                 </div>
               </div>
            </div>
          ))}
        </div>
        
        {/* Reply Box */}
        <div className="p-4 bg-[#16191f] border-t border-[#2a2e37]">
          <div className="mb-3 flex gap-2">
            <button 
              onClick={() => setIsInternalNote(false)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${!isInternalNote ? 'bg-[#2a2e37] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Public Reply
            </button>
            <button 
              onClick={() => setIsInternalNote(true)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${isInternalNote ? 'bg-amber-500/20 text-amber-400' : 'text-neutral-500 hover:text-amber-400/70'}`}
            >
              <Lock className="w-3.5 h-3.5" /> Internal Note
            </button>
          </div>
          
          <div className={`rounded-xl border transition-colors ${isInternalNote ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#2a2e37] bg-[#0f1115]'}`}>
            <textarea 
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={isInternalNote ? "Write an internal note (tenants won't see this)..." : "Write a reply to the tenant..."}
              className="w-full bg-transparent text-sm text-white p-4 outline-none resize-none placeholder:text-neutral-600"
            />
            <div className="flex items-center justify-between p-3 border-t border-black/20">
              <div className="flex gap-2">
                <button className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-[#2a2e37] rounded-lg transition-colors" title="Attach file"><Paperclip className="w-4 h-4" /></button>
                <button className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-[#2a2e37] rounded-lg transition-colors" title="Insert Canned Response"><MessageSquare className="w-4 h-4" /></button>
              </div>
              
              <Button 
                variant={isInternalNote ? 'outline' : 'primary'}
                className={isInternalNote ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/20' : 'bg-primary-600 hover:bg-primary-500'}
                icon={<Send className="w-4 h-4" />}
              >
                {isInternalNote ? 'Add Note' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
