interface errorItem {
  date: string;
  count: number;
}
interface DatadogErrorLog {
  id: string;
  type: string;
  attributes: {
    service: string;
    message: string;
    attributes: {
      severity: string;
      traceId: string;
      rest: string;
      timestamp: Date;
      stacktrace: string;
      service: string;
      pid: string;
      thread: string;
      class: string;
      span: string;
      message?: string;
    };
    status: string;
    timestamp: string;
    tags: string[];
  };
}

interface DatadogErrorData {
  data: DatadogErrorLog[];
}

function transformToErrorDetails(data: any) {
  if (!data.data === undefined || data.data?.length === 0) return;

  let counter = 1;
  const result = data?.data?.map((log: DatadogErrorLog) => {
    if (log === undefined || log === null || log.attributes === undefined || log.attributes === null) return;
    return {
      id: counter++,
      type: log.type ? 'error' : log.type,
      severity: getSeverity(log),
      date: log.attributes.attributes?.timestamp.toISOString().split('T')[0],
      stacktrace: log.attributes.attributes?.stacktrace
        ? log.attributes.attributes?.stacktrace
        : 'No stacktrace available',
      message: getMessage(log),
      source: getSource(log),
      tags: log.attributes?.tags,
    };
  });
  
  return result;
}

function getSource(log: DatadogErrorLog) {
  if (log === undefined || log === null || log.attributes === undefined || log.attributes === null) return;
  return log.attributes.attributes?.class
    ? log.attributes.attributes?.class
    : 'No source available';
}

function getMessage(log: DatadogErrorLog) {
  if (log === undefined || log === null || log.attributes === undefined || log.attributes === null) return;
  return log.attributes.attributes?.rest
    ? log.attributes.attributes?.rest
    : log.attributes.attributes?.message
    ? log.attributes.attributes?.message
    : log.attributes.attributes.stacktrace
    ? log.attributes.attributes?.stacktrace.substring(0, 100)
    : 'not available';
}

function getSeverity(log: DatadogErrorLog) {
  if (log === undefined || log === null || log.attributes === undefined || log.attributes === null) return;
  var message = log.attributes.attributes?.rest;
  if (!message) return 'low';
  var severity = message.split(':')[0];
  return severity?.toLowerCase(); 
}

export function transformErrors(data: any) {
  if (!data.data === undefined || data.data?.length === 0) return;

  const transformedData = data.data?.map((log: DatadogErrorLog) => {
    if (log === undefined || log === null || log.attributes === undefined || log.attributes === null) return;
    return {
      id: log.id,
      type: log.type,
      attributes: { 
        service: log.attributes.service,
        attributes: {
          severity: log.attributes.attributes?.severity,
          traceId: log.attributes.attributes?.traceId,
          rest: log.attributes.attributes?.rest,
          timestamp: new Date(log.attributes.timestamp),
          stacktrace: log.attributes.attributes?.stacktrace,
          service: log.attributes.attributes?.service,
          pid: log.attributes.attributes?.pid,
          thread: log.attributes.attributes?.thread,
          class: log.attributes.attributes?.class,
          span: log.attributes.attributes?.span,
          message: log.attributes?.message,
        },
        status: log.attributes.status,
        timestamp: new Date(log.attributes.timestamp),
        tags: log.attributes?.tags,
      },
    };
  });
  const chartData = daywiseErrors({ data: transformedData });
  const errorDetails = transformToErrorDetails({ data: transformedData });
  return { chartData: chartData, errorDetails: errorDetails };
}

export function daywiseErrors(data: any) {
  const errors = data.data;
  if (!errors) return;
  const errorItems: errorItem[] = [];
  var counter = 0;
  //this logic will help get the error counts against each day.
  errors.forEach((error: DatadogErrorLog) => {
    //get the error date. 
    if(error !== undefined && error.attributes !== undefined) {
      const timestamp = new Date(error.attributes.timestamp);
      //extract date part of timestamp
      const day = timestamp.toISOString().split('T')[0];
      //check if the error date is already present in the errorItems array.
      if (errorItems.length > 0 && errorItems[counter].date === day) {
        errorItems[counter].count++;
      } else {
        var errorDate = new Date(day);
        //check if the error date is NOT future and NOT found in the errorItems array then add it to the errorItems array and increament the count value against the error date.
        if (errorDate && errorDate > new Date()) return;
        errorItems.push({
          date: errorDate.toISOString().split('T')[0],
          count: 1,
        });
        //for next date, increament the counter value. Means initially errorItems array will have 0th index value.
        counter = errorItems.length - 1;
      }
    }
  });

  return buildBarchartData(errorItems);
}

export function seggregateTags(tags: string) {
  if (!tags) return [];

  const tagsArray = tags.split('&');
  type keyValuePairTags = {
    key: string;
    value: string;
  };
  const myTags: keyValuePairTags[] = [];

  tagsArray.forEach(tag => {
    const tagArray = tag.split('!');
    myTags.push({ key: tagArray[0], value: tagArray[1] });
  });

  return myTags;
}

function buildBarchartData(data: any) {
  if (!data) return;
  const chartData = {
    labels: data.map((item: errorItem) => [
      `${new Date(item.date).getDate()}-${new Date(item.date).toLocaleString(
        'default',
        {
          month: 'short',
        },
      )}`,
    ]),
    datasets: [
      {
        backgroundColor: [
          '#FB6868',
          '#FB6868',
          '#FB6868',
          '#FB6868',
          '#FB6868',
        ],
        borderColor: ['#FB6868', '#FB6868', '#FB6868', '#FB6868', '#FB6868'],
        borderWidth: 1,
        hoverBackgroundColor: [
          '#FB6868',
          '#FB6868',
          '#FB6868',
          '#FB6868',
          '#FB6868',
        ],
        hoverBorderColor: [
          '#FB6868',
          '#FB6868',
          '#FB6868',
          '#FB6868',
          '#FB6868',
        ],
        data: data.map((item: errorItem) => item.count),
      },
    ],
    //get the count of total records
    totalRecordsCount: data.reduce(
      (total: number, item: errorItem) => total + item.count,
      0,
    ),
  };
  return chartData;
}

export type { DatadogErrorLog, DatadogErrorData };
