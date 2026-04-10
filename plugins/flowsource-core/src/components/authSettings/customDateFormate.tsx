import moment from 'moment';

export default function formatDate(date:any) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
  }