import { CommonModule } from '@angular/common';
import { Component, Injector } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ChatEvent } from '../../core/models/chat-event.model';
import { ChatRoomUser } from '../../core/models/chat-room-user.model';
import { ChatRoom } from '../../core/models/chat-room.model';
import { Message } from '../../core/models/message.model';
import { AppService } from '../../core/services/app.service';
import { ChatRoomUserService } from '../../core/services/chat-room-user.service';
import { ChatService } from '../../core/services/chat.service';
import { MessageService } from '../../core/services/message.service';
import { UserService } from '../../core/services/user.service';
import { Enum } from '../../core/types/types';
import { ConfirmationDialogComponent } from '../../shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ShareChatDialogComponent } from '../../shared/components/dialogs/share-chat-dialog/share-chat-dialog.component';
import { UtilComponent } from '../../shared/components/util/util.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SharedModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent extends UtilComponent {

  public chatRoomUser$: BehaviorSubject<ChatRoomUser> = new BehaviorSubject(
    null
  );

  public events$: BehaviorSubject<ChatEvent[]> = new BehaviorSubject([]);

  public roles$: BehaviorSubject<Enum[]> = new BehaviorSubject([]);

  public messageControl$: BehaviorSubject<FormControl> = new BehaviorSubject(null);

  private readonly CHAT_ROLES_ENUM: string = "userRoleInChat";

  constructor(
    private chatRoomUserService: ChatRoomUserService,
    private chatService: ChatService,
    private userService: UserService,
    private messageService: MessageService,
    private appService: AppService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    injector: Injector
  ) {
    super(injector);
    this.chatService.setEventReceivedCallback(this.onEventReceived);
  }

  ngOnInit() {
    this.createMessageControl();
    this.onChatAccess();
  }

  public onClickExit(): void {
    this.dialog.open(ConfirmationDialogComponent, {
      inputs: {
        text: 'Deseja sair do Chat?',
        icon: 'leave'
      },
      onClose: this.handleConfirmationOption,
    });
  }

  public onClickShare(): void {
    const chatRoom: ChatRoom = this.chatRoomUser$.value?.chatRoom;
    this.dialog.open(ShareChatDialogComponent, {
      inputs: {
        chatRoomId: chatRoom?.id,
        chatRoomCode: chatRoom?.code,
      },
    });
  }

  public submitMessage(): void {
    if(this.messageControl.valid) {
      const message: string = this.handleMessageBeforeSubmitting(this.messageControl.value);
      this.messageControl.reset();
      this.messageService.send(
        message,
        this.chatRoomUser$.value
      ).subscribe({
        next: () => {},
        error: (error) => this.handleError(error)
      });
    }
  }

  private get messageControl(): FormControl {
    return this.messageControl$.value;
  }

  private handleConfirmationOption = (bool: any): void => {
    bool && this.onLeave();
  };

  private onLeave(): void {
    this.loading.start();
    const chatRoomUser: ChatRoomUser = this.chatRoomUser$.value;
    const userId: string = chatRoomUser?.user?.id;
    const chatRoomId: string = chatRoomUser?.chatRoom?.id;
    this.chatRoomUserService.left(chatRoomId, userId).subscribe({
      next: () => {
        this.chatService.close();
        this.loading.stop();
        this.router.navigate(['']);
      },
      error: (error) => {
        this.snack.error(error?.message);
        this.loading.stop();
      },
    });
  }

  private onChatAccess(): void {
    this.loading.start();
    this.loadRoles();
    this.route.paramMap.subscribe({
      next: (map: ParamMap) => {
        this.findChatRoomUserById(map.get('id'));
      },
      error: () => {
        this.snack.error('Acesso inválido');
        this.onLoadChatError();
      },
    });
  }

  private findChatRoomUserById(chatRoomId: string): void {
    const userId: string = this.userService.getUserId();
    this.chatRoomUserService.read(chatRoomId, userId).subscribe({
      next: (chatRoomUser: ChatRoomUser) => {
        this.chatService.connect(chatRoomId);
        console.log('chegou aqui')
        this.chatRoomUser$.next(chatRoomUser);
        this.events$.next(
          chatRoomUser?.chatRoom?.messages?.map(ChatEvent.buildFromMessage)
        );
        this.loading.stop();
      },
      error: (error) => {
        this.snack.error(error?.message);
        this.snack.info('Retornando para o lobby');
        this.loading.stop();
        this.router.navigate([`/lobby${chatRoomId}`]);
      },
    });
  }

  private loadRoles(): void {
    this.appService.loadEnumByType(this.CHAT_ROLES_ENUM).subscribe({
      next: (enums: Enum[]) => {
        this.roles$.next(enums);
      },
      error: (error: any) => {
        this.snack.error(error?.message);
        this.onLoadChatError();
      },
    });
  }

  private onEventReceived = (event: ChatEvent): void => {
    const events: ChatEvent[] = this.events$.value;
    events.push(event);
    this.events$.next(events);
  };

  private createMessageControl(): void {
    this.messageControl$.next(
      this.fb.control(
        '',
        [Validators.required]
      )
    );
  }

  private handleMessageBeforeSubmitting(message: string): string {
    return message?.trim();
  }

}
