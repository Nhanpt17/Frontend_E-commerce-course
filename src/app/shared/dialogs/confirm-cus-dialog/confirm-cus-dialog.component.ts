import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-cus-dialog',
  templateUrl: './confirm-cus-dialog.component.html',
  styleUrls: ['./confirm-cus-dialog.component.css']
})
export class ConfirmCusDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmCusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
