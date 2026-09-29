/* ═══════════════════════════════════════════════════════
   SkySignal — Event Detail Drawer
   Inspection panel for meteorological analysts (SIH26069)
   Wrapper around EventDetailSheet with Admin RBAC guard
   ═══════════════════════════════════════════════════════ */

import EventDetailSheet from '../overlays/EventDetailSheet';
import type { WeatherEvent, LifecycleStatus } from '../../types/weather';

interface EventDetailDrawerProps {
  event: WeatherEvent | any | null;
  onClose: () => void;
  onStatusChange?: (eventId: string, newStatus: LifecycleStatus | any) => void;
}

export default function EventDetailDrawer({
  event,
  onClose,
  onStatusChange,
}: EventDetailDrawerProps) {
  if (!event) return null;

  return (
    <EventDetailSheet
      event={event}
      onClose={onClose}
      onStatusChange={onStatusChange}
    />
  );
}

export { EventDetailSheet };
