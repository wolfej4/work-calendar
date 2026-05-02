declare module 'ical.js' {
  class Component {
    constructor(jcal: unknown[]);
    getAllSubcomponents(name: string): Component[];
    getFirstPropertyValue(name: string): unknown;
  }

  class Event {
    constructor(component: Component);
    uid: string;
    summary: string;
    description: string;
    location: string;
    startDate: Time;
    endDate: Time;
    duration: Duration;
    isRecurring(): boolean;
    iterator(startDate?: Time): RecurExpansion;
    getOccurrenceDetails(occurrence: Time): OccurrenceDetails;
  }

  class Time {
    isDate: boolean;
    toJSDate(): Date;
    clone(): Time;
    addDuration(duration: Duration): void;
  }

  class Duration {}

  class RecurExpansion {
    next(): Time | null;
  }

  interface OccurrenceDetails {
    startDate: Time;
    endDate: Time;
    item: Event;
  }

  function parse(input: string): unknown[];
}
