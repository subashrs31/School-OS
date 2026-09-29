import emitter from './emitter';
import EVENTS from './events';
import queue from '../queue/Queue';

function registerListeners(): void {
  emitter.on(EVENTS.PASSWORD_RESET_REQUESTED, ({ email, name, resetLink }: { email: string; name: string; resetLink: string }) => {
    queue.dispatch('SendMailJob', { to: email, subject: 'Password Reset Request', template: 'resetPassword', variables: { name, resetLink } }, { priority: queue.PRIORITY.HIGH });
  });

  emitter.on(EVENTS.USER_REGISTERED, ({ email, name }: { email: string; name: string }) => {
    queue.dispatch('SendMailJob', { to: email, subject: 'Welcome!', template: 'welcome', variables: { name } });
  });

  console.log('[Events] Listeners registered');
}

export default registerListeners;
