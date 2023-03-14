from main import *
from macros import *

class Player(p.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # starting point
        self.x = WIDTH / 2
        self.y = HEIGHT

        # how fast player is
        self.vel = 1.5

        # how big the player is
        self.width = 50
        self.height = 100

        self.y -= self.height / 2

        self.PlayerUp = p.image.load("Pictures\player_models\catUp.png")
        self.PlayerDown = p.image.load("Pictures\player_models\catDown.png")

        self.PlayerUp = p.transform.scale(self.PlayerUp, (self.width, self.height))
        self.PlayerDown = p.transform.scale(self.PlayerDown, (self.width, self.height))

        self.image = self.PlayerUp
        self.rect = self.image.get_rect()
    
    def update(self):
        self.rect.center = (self.x, self.y)
        return self.movement()
    
    def movement(self):
        scroll = 0
        keys = p.key.get_pressed()

        if keys[p.K_LEFT]:
            if self.x - self.vel - (self.width / 2) >= 0:
                self.x -= self.vel
        
        if keys[p.K_RIGHT]:
            if self.x + self.vel + (self.width / 2) <= WIDTH:
                self.x += self.vel
        
        if keys[p.K_UP]:
            if self.y - self.vel - (self.height / 2) >= 0:
                self.y -= self.vel
            self.image = self.PlayerUp
        
        if keys[p.K_DOWN]:
            if self.y + self.vel + (self.height / 2) <= HEIGHT:
                self.y += self.vel
            self.image = self.PlayerDown

        # check if player has triggered a scroll up
        SCROLL_THRESH = (HEIGHT / 2)
        if self.y <= SCROLL_THRESH:
            scroll = SCROLL_THRESH - self.y
            self.y = SCROLL_THRESH
        
        return scroll


class Car(p.sprite.Sprite):
    def __init__(self, speed_flag):
        super().__init__()
        if speed_flag == 1:
            self.y = (HEIGHT / 5) * 3
            self.image = p.image.load("Pictures\cars\Slow Car.png")
            self.vel = -4
        
        else:
            self.y = (HEIGHT / 5) * 1
            self.image = p.image.load("Pictures\cars\Fast Car.png")
            self.vel = 5

        self.x = WIDTH / 2
        self.width = 150
        self.height = 100
        self.image = p.transform.scale(self.image, (self.width, self.height))
        self.rect = self.image.get_rect()
    
    def update(self, scroll):
        self.movement()
        self.rect.center = (self.x, self.y)
        self.y += scroll
    
    def movement(self):
        self.x += self.vel

        if self.x - self.width / 2 < 0:
            self.x = self.width / 2
            self.vel *= -1

        elif self.x + self.width / 2 > WIDTH:
            self.x = WIDTH - self.width / 2
            self.vel *= -1
        