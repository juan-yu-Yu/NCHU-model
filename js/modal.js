//modal
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.querySelector('#membersBtn');
    new bootstrap.Popover(trigger, {
        trigger: 'focus',
        placement: 'right',
        html: true,
        container: 'body'
    });
});

// .info-card
document.querySelector('.info-card').classList.add('show');