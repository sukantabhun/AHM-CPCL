import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { interval, startWith, switchMap } from 'rxjs';
import { DynamicTableComponent } from "../dynamic-table/dynamic-table.component";
import { LoginService } from '../login/login.service';
import { NotificationCountService } from '../services/notification-count.service';
import { DYNAMIC_TABLE } from '../utils/constants/common';
import { NotificationService } from '../utils/notification/notification.service';
import { SentenceCasePipe } from '../utils/pipes/sentence-case.pipe';
import { ApiService } from '../utils/services/api.service';
import { DataUpdateService } from '../utils/services/data-service.service';
import { ModalService } from '../utils/services/modal-service.service';
import { DashboardCardComponent } from "./details-dashboard/details-dashboard.component";

@Component({
  selector: 'app-dashboard',
  imports: [
    DynamicTableComponent,
    CommonModule,
    FormsModule,
    SentenceCasePipe,
    MatProgressSpinnerModule,
    MatTabsModule,
    DashboardCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  areaOptions = [
    'SS1', 'EURO-4', 'NEW HGU', 'DHDS', 'LEB', 'OPH', 'GT-4', 'NPH',
    'GT-5', 'DCU', '110 KV YARD', 'FCCU', 'REFINARY-2', 'REFINARY-1',
    'SS-2', 'RESID SRU', 'DM', 'CPP', 'SS-5', 'SS-6', 'SS-7',
    'SS-4', 'TTP', 'ETP', 'ETP-4', 'ETP-3', 'DMRO ETP-2'
  ];

  notifications: any[] = [];
  selectedTabIndex = 0;
  data: any;
  analysisdata: any;
  user = JSON.parse(localStorage.getItem('user_data') || '');
  subscription: any;
  isShowLoader: any;
  listToShow = 'Pending'
  listToShow2 = 'Transformer'

  @ViewChild('bell') bell!: ElementRef;

  searchText = '';
  selectedAreaType = '';
  selectedUserType = '';
  selectedMachineType = '';

  pollSub: any;
  usersList: any[] = [];

  constructor(
    private notificationCount: NotificationCountService,
    private readonly modalService: ModalService,
    private notification: NotificationService,
    private apiService: ApiService,
    private loginService: LoginService,
    private dataUpdateService: DataUpdateService
  ) {}

  public tableConfig = DYNAMIC_TABLE.DASHBOARD;
  public actableConifg = DYNAMIC_TABLE.ANALYSIS_CONFIG;
  public userConfig = DYNAMIC_TABLE.DASHBOARD4;

  currentVal = 0;
  currentArr: any[] = [];

  ngOnInit(): void {
    if (this.user.role === 'AD') this.allUsers();

    if (this.user.role === 'SP' || this.user.role === 'AD') this.apiData();
    else this.fetchApiDatabyUsername();

    this.notificationCount.currentData.subscribe(data => this.currentVal = data);
    this.notificationCount.currentArray.subscribe(data => this.currentArr = data);

    this.pollSub = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.notification.getNotifications())
      )
      .subscribe({
        next: (data: any[]) => {
          this.notifications = data;
          this.notificationCount.updateCount(this.notifications.length, this.notifications);
        },
        error: (err: any) => {
          console.error('Notification API error:', err);
        }
      });

    this.subscription = this.dataUpdateService.updateData$.subscribe(() => {
      if (this.user.role === 'SP' || this.user.role === 'AD') this.apiData();
      else this.fetchApiDatabyUsername();
      if (this.user.role === 'AD') this.allUsers();
    });

    if (this.user.role === 'AD') this.tableConfig = DYNAMIC_TABLE.DASHBOARD2;
    if (this.user.role === 'AD') this.actableConifg = DYNAMIC_TABLE.DASHBOARD6;

  }

  allUsers() {
    this.apiService.getAllUsersData().subscribe({
      next: (res) => this.usersList = res,
      error: (e) => console.error(e)
    });
  }

  toggleList(i:any){
    this.listToShow = i
  }

  toggleList2(i:any){
    this.listToShow2 = i
  }

  filteredItems(items: any) {
    if (!items) return [];
    const textArea = this.selectedAreaType.toLowerCase();
    const textSearch = this.searchText.toLowerCase();
    const textMachine = this.selectedMachineType.toLowerCase();

    return items.filter((item: any) => {
      const matchArea = !this.selectedAreaType || this.selectedAreaType === 'All' || item.area.toLowerCase().includes(textArea);
      const matchSearch = !this.searchText || item.name.toLowerCase().includes(textSearch);
      const matchMachine = !this.selectedMachineType || this.selectedMachineType === 'All' || item.machine_type.toLowerCase().includes(textMachine);
      return matchArea && matchSearch && matchMachine;
    });
  }

    filteredItems4(items: any) {
    if (!items) return [];
    const textArea = this.selectedAreaType.toLowerCase();
    const textSearch = this.searchText.toLowerCase();
    const textMachine = this.selectedMachineType.toLowerCase();

    return items.filter((item: any) => {
      const matchArea = !this.selectedAreaType || this.selectedAreaType === 'All' || item.area.toLowerCase().includes(textArea);
      const matchSearch = !this.searchText || item.name.toLowerCase().includes(textSearch);
      const matchMachine = !this.selectedMachineType || this.selectedMachineType === 'All' || item.machine_type.toLowerCase().includes(textMachine);
      return matchArea && matchSearch && matchMachine;
    });
  }

  filteredItems2(items: any) {
    if (!items) return [];
    if (!this.searchText) return items;
    const text = this.searchText.toLowerCase();
    return items.filter((item: any) => item.machine_id.toLowerCase().includes(text));
  }

  filteredItems3(items: any) {
    if (!items) return [];
    const textUser = this.selectedUserType.toLowerCase();
    const textSearch = this.searchText.toLowerCase();

    return items.filter((item: any) => {
      const matchUser = !this.selectedUserType || this.selectedUserType === 'All' || item.role.toLowerCase().includes(textUser);
      const matchSearch = !this.searchText || item.username.toLowerCase().includes(textSearch);
      return matchUser && matchSearch;
    });
  }

  clearFilters() {
    this.searchText = '';
    this.selectedAreaType = '';
    this.selectedUserType = '';
    this.selectedMachineType = '';
  }

  apiData() {
    this.isShowLoader = true;
    this.apiService.getMachineData().subscribe({
      next: (res: any) => {
        this.data = {
          tbrList: res.machineTBR,
          allList: res.allMachines,
          dueList: res.machineWithDues,
          auditList: res.machineOnAudit
        };
        this.isShowLoader = false;
      },
      error: (error: any) => {
        alert(error.message);
        console.error('Error fetching machine data:', error);
        this.isShowLoader = false;
      }
    });
    this.apiService.getAnalysisData().subscribe({
      next: (res: any) => {
        this.analysisdata = {
          Transformer: res.Transformer,
          Compressor: res.Compressor
        };
        this.isShowLoader = false;
      },
      error: (error: any) => {
        alert(error.message);
        console.error('Error fetching analysis data:', error);
        this.isShowLoader = false;
      }
    });
  }

  fetchApiDatabyUsername() {
    this.isShowLoader = true;
    this.apiService.getAudits(this.user).subscribe({
      next: (res: any) => {
        this.data = { dueList: res };
        this.isShowLoader = false;
      },
      error: (error: any) => {
        alert(error);
        console.error('Error fetching user audits:', error);
        this.isShowLoader = false;
      }
    });
  }

  onClickClear() {
    this.searchText = '';
  }

  openAuditDialog(data: any) {
    this.modalService.auditDialog(data);
  }

  openDynamicForm(data: any) {
    this.modalService.dynamicForm(data);
  }

  onClickLogout() {
    this.loginService.logout();
  }

  openCreateUser() {
    this.modalService.createUser().subscribe(() => {
      this.allUsers();
  });
  }

  openCreateMachine() {
    this.modalService.createMachine().subscribe(() => {
      this.apiData()
    });
  }

  openDetailForm(data: any) {
    this.modalService.openHistory(data);
  }

  togglePopup() {
    if (this.currentArr.length !== 0) {
      const rect = this.bell.nativeElement.getBoundingClientRect();
      this.modalService.showTagsPopup(
        JSON.parse(localStorage.getItem('user_data') || ''),
        rect,
        this.currentArr
      );
    }
  }

  ngOnDestroy(): void {
    this.pollSub.unsubscribe();
  }
}
