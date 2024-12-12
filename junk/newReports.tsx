useEffect(() => {
    const dateInput = dayjs(startDate).format("YYYY-MM-DD");
    const timeInput = dayjs(startDate).format("hh:mm A");
    console.log(dateInput);
    setDate(dateInput);
    setTime(timeInput);
    setReportTime(startDate);
  }, [startDate]);