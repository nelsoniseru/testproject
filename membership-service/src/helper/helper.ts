
export const getDateRange=(planType)=>{
    const currentDate = new Date();
    const endDate = new Date(currentDate);
  
    if (planType.includes('Annual')) {
      endDate.setFullYear(currentDate.getFullYear() + 1);
    } else if (planType.includes('Monthly')) {
      endDate.setMonth(currentDate.getMonth() + 1);
    } else {
      throw new Error('Unsupported plan type');
    }
  
    return {
      start_date: currentDate,
      end_date: endDate,
    };
  }
  