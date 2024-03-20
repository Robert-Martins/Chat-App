import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DialogsService } from '../dialogs.service';
import { BehaviorSubject } from 'rxjs';

type ConfirmationDialogIcons = null | 'leave';

@Component({
  selector: 'swift-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {

  @Input()
  public set text(confirmationText: string) {
    this.confirmationText$.next(confirmationText);
  }

  @Input()
  public set icon(iconName: ConfirmationDialogIcons) {
    this.iconClass$.next(iconName ? iconName : null);
  }

  public confirmationText$: BehaviorSubject<string> = new BehaviorSubject(null);

  public iconClass$: BehaviorSubject<ConfirmationDialogIcons> = new BehaviorSubject(null);

  constructor(
    private dialogService: DialogsService
  ) {
  }

  public onClickOption(bool: boolean): void {
    this.dialogService.close(bool);
  }

}
