import React, { useState, useEffect } from "react";
import {
  DatePicker,
  Table,
  Button,
  Select,
  Input,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import {
  SearchOutlined,
  FileExcelOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./AttendanceReport.css";
import * as AttendanceService from "../../services/attendanceService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AttendanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: [dayjs().startOf("month"), dayjs().endOf("month")],
    group: null,
    mentor: null,
    searchText: "",
  });

  const [summary, setSummary] = useState({
    totalInterns: 0,
    totalWorkingDays: 0,
    totalLateDays: 0,
    totalAbsentDays: 0,
  });

  // Load data khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Gọi API với filters
      const response = await AttendanceService.getAttendanceReport(filters);

      console.log("API Response:", response);

      // Xử lý response data
      let attendanceData = [];

      if (response && response.data) {
        attendanceData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        attendanceData = response;
      }

      // Transform data nếu cần (tùy theo cấu trúc backend trả về)
      const transformedData = attendanceData.map((record, index) => ({
        key: record.id || index,
        id: record.id,
        employeeId: record.internId || record.employeeId || `TTS${index + 1}`,
        fullName: record.internName || record.fullName || "N/A",
        department: record.department || "Chưa phân công",
        workingDays: record.totalWorkingDays || record.workingDays || 0,
        leaveDays: record.totalLeaveDays || record.leaveDays || 0,
        lateDays: record.totalLateDays || record.lateDays || 0,
        absentDays: record.totalAbsentDays || record.absentDays || 0,
      }));

      setDataSource(transformedData);

      // Tính toán summary
      const summaryData = transformedData.reduce(
        (acc, curr) => ({
          totalInterns: acc.totalInterns + 1,
          totalWorkingDays:
            acc.totalWorkingDays + (parseInt(curr.workingDays) || 0),
          totalLateDays: acc.totalLateDays + (parseInt(curr.lateDays) || 0),
          totalAbsentDays:
            acc.totalAbsentDays + (parseInt(curr.absentDays) || 0),
        }),
        {
          totalInterns: 0,
          totalWorkingDays: 0,
          totalLateDays: 0,
          totalAbsentDays: 0,
        }
      );

      setSummary(summaryData);

      if (transformedData.length === 0) {
        message.info("Không có dữ liệu trong khoảng thời gian này");
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chuyên cần:", error);
      message.error(error.message || "Không thể tải dữ liệu báo cáo");
      setDataSource([]);
      setSummary({
        totalInterns: 0,
        totalWorkingDays: 0,
        totalLateDays: 0,
        totalAbsentDays: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã TTS",
      dataIndex: "employeeId",
      key: "employeeId",
      fixed: "left",
      width: 100,
    },
    {
      title: "Tên thực tập sinh",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
      width: 180,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Số ngày đi làm",
      dataIndex: "workingDays",
      key: "workingDays",
      width: 120,
      sorter: (a, b) => (a.workingDays || 0) - (b.workingDays || 0),
      render: (days) => <span className="working-days">{days || 0} ngày</span>,
    },
    {
      title: "Nghỉ phép",
      dataIndex: "leaveDays",
      key: "leaveDays",
      width: 100,
      sorter: (a, b) => (a.leaveDays || 0) - (b.leaveDays || 0),
      render: (days) => <span className="leave-days">{days || 0} ngày</span>,
    },
    {
      title: "Đi muộn",
      dataIndex: "lateDays",
      key: "lateDays",
      width: 100,
      sorter: (a, b) => (a.lateDays || 0) - (b.lateDays || 0),
      render: (days) => (
        <span className={days > 0 ? "late-days" : ""}>
          {days > 0 ? `${days} lần` : "Không"}
        </span>
      ),
    },
    {
      title: "Vắng mặt",
      dataIndex: "absentDays",
      key: "absentDays",
      width: 110,
      sorter: (a, b) => (a.absentDays || 0) - (b.absentDays || 0),
      render: (days) => (
        <span className={days > 0 ? "absent-days" : ""}>
          {days > 0 ? `${days} ngày` : "Không"}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container attendance-report">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Báo cáo chuyên cần thực tập sinh</h1>
      </div>

      {/* Summary Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">👥</div>
          <div className="stat-info">
            <div className="stat-value">{summary.totalInterns}</div>
            <div className="stat-label">Tổng số TTS</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {summary.totalWorkingDays}
            </div>
            <div className="stat-label">Tổng ngày làm việc</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {summary.totalLateDays}
            </div>
            <div className="stat-label">Tổng lần đi muộn</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-rejected-icon">✕</div>
          <div className="stat-info">
            <div className="stat-value stat-rejected-value">
              {summary.totalAbsentDays}
            </div>
            <div className="stat-label">Tổng ngày vắng mặt</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <div className="table-wrapper">
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng cộng: ${total} TTS`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              scroll={{ x: 1000 }}
              bordered
              size="middle"
              locale={{
                emptyText: (
                  <div className="empty">
                    <div className="empty-icon">📊</div>
                    <div className="empty-text">Không có dữ liệu</div>
                  </div>
                ),
              }}
            />
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default AttendanceReport;
