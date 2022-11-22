import moment from "moment";
import React, { useEffect, useState } from "react";
import { Line } from "@ant-design/plots";
import axios from "axios";
import { DatePicker } from "antd/lib";
import "antd/dist/antd.css";
import "./style.css";

const Chart = () => {
  const [data, setData] = useState();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndtDate] = useState("");

  useEffect(() => {
    const url = `https://hfnqxm0l19.execute-api.eu-central-1.amazonaws.com/staging/visitorsData?startTime=${startDate}&endTime=${endDate}&domain=dev-showroom`;
    axios.get(url).then((res) => {
      setData(res.data);
    });
  }, [endDate, startDate]);

  const handleChange = (val) => {
    setStartDate(moment(val[0]._d).format("YYYY-MM-DD"));
    setEndtDate(moment(val[1]._d).format("YYYY-MM-DD"));
  };

  const differenceInDays = moment(endDate).diff(
    moment(startDate),
    "days",
    true
  );
  const totaldays = Math.ceil(differenceInDays);

  const differenceInWeeks = moment(endDate).diff(
    moment(startDate),
    "weeks",
    true
  );
  const totalweeks = Math.ceil(differenceInWeeks);

  const totalMonths = moment(endDate)
    .endOf("month")
    .diff(moment(startDate).startOf("month"), "months", true);
  var xAxis;
  if (totalweeks > 16) {
    xAxis = Array.from(
      { length: totalMonths },
      (_, index) =>
        `${moment(startDate).add("month", index).format("MMMM")}-${moment(
          startDate
        ).format("YYYY")}`
    );
  } else if (totaldays > 30) {
    xAxis = Array.from(
      { length: totalweeks },
      (_, index) =>
        `${moment(startDate).add("week", index).format("ww")}-${moment(
          startDate
        ).format("YYYY")}`
    );
  } else {
    xAxis = Array.from(
      { length: totaldays },
      (_, index) =>
        `${moment(startDate).add("day", index).format("DD")}-${moment(
          startDate
        ).format("MMM-YYYY")}`
    );
  }
  // console.debug("data", data);
  const placeholder = xAxis?.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: {
        showroomVisits: 0,
        conferences: 0,
      },
    };
  }, {});

  data &&
    data.data.conferences.forEach((item) => {
      var date;
      if (totaldays > 30 && totalweeks < 16) {
        date = moment(item.createdDate).format("WW-YYYY");
        console.log("week ran");
      } else if (totalweeks > 16 && totaldays > 30) {
        date = moment(item.createdDate).format("MMMM-YYYY");
        console.log("month ran");
      } else if (totalweeks <= 16 && totaldays <= 30) {
        date = moment(item.createdDate).format("DD-MMM-YYYY");
        console.log("day ran");
      } else {
        console.log("hello");
      }

      if (date && placeholder[date]) {
        placeholder[date].conferences += 1;
      }
    });

  const _data = Object.keys(placeholder).reduce((acc, key) => {
    return [
      ...acc,
      {
        label: key,
        value: placeholder[key].conferences,
      },
    ];
  }, []);

  const config = {
    data: _data,
    padding: "auto",
    xField: "label",
    yField: "value",
    smooth: true,
  };

  return (
    <>
      <h1 className="heading">Line Chart</h1>
      <div className="date-picker">
        <DatePicker.RangePicker
          format="YYYY-MM-DD HH:mm"
          onChange={handleChange}
        />
      </div>
      <Line {...config} />
    </>
  );
};

export default Chart;
