import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../utils/services/api.service';

@Component({
  selector: 'app-create-new-machine',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-new-machine.component.html',
  styleUrl: './create-new-machine.component.css'
})
export class CreateNewMachineComponent {
  machineForm!: FormGroup;
  areaOptions = ['SS1', 'EURO-4' , 'NEW HGU', 'DHDS', 'LEB', 'OPH','GT-4', 'NPH', 'GT-5' , 'DCU', '110 KV YARD', 'FCCU', 'REFINARY-2', 'REFINARY-1','SS-2','RESID SRU','DM', 'CPP', 'SS-5','SS-6','SS-7','SS-4','TTP','ETP','ETP-4','ETP-3','DMRO ETP-2'];
  machineTypeOptions = ['Compressor', 'Transformer'];

  constructor(private fb: FormBuilder , private apiService: ApiService, private dialogRef: MatDialogRef<CreateNewMachineComponent>) {}

  ngOnInit(): void {
    this.machineForm = this.fb.group({
      area: [''],
      machine_type: [{ value: '', disabled: true }],
      rated_kva: [0],
      voltage_ratio: [''],
      current_ratio: [''],
      oil_capacity: [0],
      make: [''],
      frequency: [{ value: '', disabled: true }],
      name: ['']
    });


    // Enable machine_type when area is selected
    this.machineForm.get('area')?.valueChanges.subscribe((val:any) => {
      if (val) {
        this.machineForm.get('machine_type')?.enable();
      } else {
        this.machineForm.get('machine_type')?.reset();
        this.machineForm.get('machine_type')?.disable();
        this.machineForm.get('frequency')?.reset();
        this.machineForm.get('frequency')?.disable();
      }
    });

    // Enable frequency when machine_type is selected
    this.machineForm.get('machine_type')?.valueChanges.subscribe((val:any) => {
      if (val) {
        this.machineForm.get('frequency')?.enable();
      } else {
        this.machineForm.get('frequency')?.reset();
        this.machineForm.get('frequency')?.disable();
      }
    });
  }

  onSubmit() {
    this.apiService.createMachine(this.machineForm.value).subscribe({
      next: (res:any  ) => {
        alert('Machine Successfully created')
        this.dialogRef.close()
      },
      error: (error: any) => {
        alert(error.message)
        console.error('Error fetching machine data:', error);
      }
    })
  }
}
