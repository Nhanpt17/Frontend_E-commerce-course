import { MatSnackBar } from '@angular/material/snack-bar';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ReportService } from '../../service/report.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-revenue-report',
  templateUrl: './revenue-report.component.html',
  styleUrls: ['./revenue-report.component.css']
})
export class RevenueReportComponent implements OnInit, AfterViewInit {
  @ViewChild('dailyChart') dailyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentMethodChart') paymentMethodChartRef!: ElementRef<HTMLCanvasElement>;

  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  endDate: Date = new Date();

  totalRevenue: number = 0;
  dailyChart: Chart | undefined;
  monthlyChart: Chart | undefined;
  paymentMethodChart: Chart | undefined;

  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private reportService: ReportService,
    private snackbar:MatSnackBar
  ) {
    Chart.register(...registerables);
  }
  ngAfterViewInit(): void {
    this.loadReport();
  }
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  loadReport(): void {
    this.isLoading = true;
    this.destroyCharts();
    // Format date thành string YYYY-MM-DD (không có timezone)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startStr = formatDate(this.startDate);
  const endStr = formatDate(this.endDate);
    
  console.log('Sending to server:', {
    start: startStr.toString(),
    end: endStr.toString()
  });

    this.reportService.getRevenueReport(startStr, endStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
         
          this.totalRevenue = report.totalRevenue;
          this.isLoading = false;

          // Use setTimeout to ensure change detection completes and DOM is updated
          setTimeout(() => {
            this.createDailyRevenueChart(report.dailyRevenues);
            this.createMonthlyRevenueChart(report.monthlyRevenues);
            this.createPaymentMethodChart(report.paymentMethodRevenues);
          });
        },
        error: (err) => {
          
          const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
          this.snackbar.open(errorMessage,'Đóng',{duration:1000});
          this.isLoading = false;
        }
      });
  }

  private destroyCharts(): void {
    if (this.dailyChart) {
      this.dailyChart.destroy();
      this.dailyChart = undefined;
    }
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
      this.monthlyChart = undefined;
    }
    if (this.paymentMethodChart) {
      this.paymentMethodChart.destroy();
      this.paymentMethodChart = undefined;
    }
  }


  createDailyRevenueChart(data: any[]): void {

   

    if (!this.dailyChartRef?.nativeElement) {
     
      return;
    }

    const labels = data.map(item => item.date);
    const amounts = data.map(item => item.amount);

    //const canvas = document.getElementById('dailyChart') as HTMLCanvasElement;

    if (this.dailyChart) {
      this.dailyChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu theo ngày',
          data: amounts,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Doanh thu theo ngày'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số tiền'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Ngày'
            }
          }
        }
      }
    };

    //this.dailyChart = new Chart(canvas, config);
    this.dailyChart = new Chart(this.dailyChartRef.nativeElement, config);

  }

  createMonthlyRevenueChart(data: any[]): void {
    console.log("monthlyChartRef", this.monthlyChartRef);
    const labels = data.map(item => `${item.month}/${item.year}`);
    const amounts = data.map(item => item.amount);

    if (!this.monthlyChartRef?.nativeElement) {
      
      return;
    }

    //const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    //console.log("Canvas Monthly:", canvas);
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }


    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu theo tháng',
          data: amounts,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Doanh thu theo tháng'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số tiền'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tháng/Năm'
            }
          }
        }
      }
    };

    // this.monthlyChart = new Chart(canvas, config);
    this.monthlyChart = new Chart(this.monthlyChartRef.nativeElement, config);
  }

  createPaymentMethodChart(data: any[]): void {
    

    //const canvas = document.getElementById('paymentMethodChart') as HTMLCanvasElement;
    const labels = data.map(item => item.paymentMethod);
    const amounts = data.map(item => item.amount);

    if (!this.paymentMethodChartRef?.nativeElement) {
      
      return;
    }

    if (this.paymentMethodChart) {
      this.paymentMethodChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu theo phương thức thanh toán',
          data: amounts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Doanh thu theo phương thức thanh toán'
          }
        }
      }
    };

    // this.paymentMethodChart = new Chart(canvas, config);
    this.paymentMethodChart = new Chart(this.paymentMethodChartRef.nativeElement, config);
  }

  onDateChange(type: 'start' | 'end', event: MatDatepickerInputEvent<Date>): void {
    if (type === 'start') {
      // Đặt giờ là 00:00:00 theo local time (GMT+7)
      const date = event.value || new Date();
      date.setHours(0, 0, 0, 0);
      this.startDate = date;
    } else {
      // Đặt giờ là 23:59:59 theo local time (GMT+7)
      const date = event.value || new Date();
      date.setHours(23, 59, 59, 999);
      this.endDate = date;
    }
    this.loadReport();
  }



}
